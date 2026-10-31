package io.github.yusufbas34.tasmaqr;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.job.JobInfo;
import android.app.job.JobParameters;
import android.app.job.JobScheduler;
import android.app.job.JobService;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Arka planda (uygulama kapalıyken de) yaklaşık 15 dakikada bir:
 *  - rozetleriniz için bulan kişi yeni konum gönderdi mi,
 *  - kayıp modundaki bir rozet okutuldu mu,
 *  - siparişlerin durumu değişti mi,
 *  - (yalnızca elden kurulan APK'da) GitHub'da yeni sürüm var mı
 * diye bakar ve bildirim gösterir. Ek kütüphane ya da Firebase gerektirmez.
 * Rozetleri ve siparişleri web arayüzü AndroidBridge.syncTags / syncOrders ile buraya bildirir.
 */
public class Notifier extends JobService {
    static final String SUPABASE_URL = "https://vsurqyzjtxtbhhbtbhgz.supabase.co";
    static final String SUPABASE_KEY = "sb_publishable_Dz8WxGrendM_qa9UxVbC3g_nvwAnCcH";
    static final String RELEASE_API = "https://api.github.com/repos/yusufbas34/tasmaqr/releases/tags/apk-son";
    static final String APK_URL = "https://github.com/yusufbas34/tasmaqr/releases/download/apk-son/tasma-qr.apk";
    static final String EXTRA_ROUTE = "route";
    private static final int JOB_ID = 1;
    private static final long PERIOD = 15 * 60 * 1000L;  // Android'in izin verdiği en kısa aralık
    private static final String PREFS = "tasmaqr";
    private static final String CH_FOUND = "bulundu", CH_ORDERS = "siparis", CH_UPDATE = "guncelleme";

    /** Uygulama her açıldığında çağrılır; görev zaten kuruluysa dokunmaz. */
    static void schedule(Context ctx) {
        JobScheduler js = ctx.getSystemService(JobScheduler.class);
        JobInfo old = js == null ? null : js.getPendingJob(JOB_ID);
        if (js == null || (old != null && old.getIntervalMillis() == PERIOD)) return;  // aralık değiştiyse yeniden kur
        js.schedule(new JobInfo.Builder(JOB_ID, new ComponentName(ctx, Notifier.class))
                .setPeriodic(PERIOD)                                  // Android pil durumuna göre kaydırabilir
                .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
                .setPersisted(true)                                   // telefon yeniden başlasa da sürer
                .build());
    }

    /** Web arayüzünden gelen rozet listesi: [{code, pin, name}] */
    static void syncTags(Context ctx, String json) {
        try {
            new JSONArray(json);  // geçerli mi
            prefs(ctx).edit().putString("tags", json).apply();
        } catch (Exception ignored) {
        }
    }

    /** Web arayüzünden gelen sipariş listesi: [{code, token, status}]. Bilinen durumlar için bildirim gösterilmez. */
    static void syncOrders(Context ctx, String json) {
        try {
            JSONArray incoming = new JSONArray(json);
            // Arka planda öğrenilen son durumu koru: aynı değişiklik için iki kez bildirim gitmesin
            JSONArray known = new JSONArray(prefs(ctx).getString("orders", "[]"));
            for (int i = 0; i < incoming.length(); i++) {
                JSONObject o = incoming.getJSONObject(i), k = find(known, o.optString("code"));
                if (k != null && !k.optString("status").isEmpty()) o.put("status", k.optString("status"));
            }
            prefs(ctx).edit().putString("orders", incoming.toString()).apply();
        } catch (Exception ignored) {
        }
    }

    @Override
    public boolean onStartJob(JobParameters params) {
        new Thread(() -> {
            try { checkTags(); } catch (Exception ignored) { }
            try { checkOrders(); } catch (Exception ignored) { }
            // Play sürümü kendini güncellemez; güncelleme duyurusunu Play Store yapar
            if (!"play".equals(BuildConfig.FLAVOR)) try { checkUpdate(); } catch (Exception ignored) { }
            jobFinished(params, false);
        }).start();
        return true;
    }

    @Override
    public boolean onStopJob(JobParameters params) {
        return true;  // yarıda kalırsa sonra yeniden dene
    }

    /** Rozetlerim'deki "Deneme bildirimi" butonu */
    static boolean showTest(Context ctx) {
        return post(ctx, CH_UPDATE, 999, "Bildirimler çalışıyor ✓",
                "Dostunuz için konum gönderildiğinde, kayıp modundayken rozet okutulduğunda ve siparişiniz ilerlediğinde böyle haber vereceğiz.",
                open(ctx, null));
    }

    // ---------------------------------------------------------------- rozetler: yeni konum, kayıp modunda okutma
    private void checkTags() throws Exception {
        SharedPreferences p = prefs(this);
        JSONArray tags = new JSONArray(p.getString("tags", "[]"));
        if (tags.length() == 0) return;
        JSONArray codes = new JSONArray(), pins = new JSONArray();
        for (int i = 0; i < tags.length(); i++) {
            codes.put(tags.getJSONObject(i).optString("code"));
            pins.put(tags.getJSONObject(i).optString("pin"));
        }
        JSONObject args = new JSONObject().put("p_codes", codes).put("p_pins", pins);
        JSONArray rows = new JSONArray(http("POST", SUPABASE_URL + "/rest/v1/rpc/tasma_tag_stats", args.toString(), true));
        JSONObject seen = new JSONObject(p.getString("seen", "{}"));  // kod -> {sighting: son konum zamanı, total: okutma sayısı}
        for (int i = 0; i < rows.length(); i++) {
            JSONObject r = rows.getJSONObject(i);
            String code = r.optString("code"), name = r.isNull("pet_name") ? "" : r.optString("pet_name");
            String who = name.isEmpty() ? "Sevimli dostunuz" : name;
            JSONArray sightings = r.optJSONArray("sightings");
            String lastSighting = sightings != null && sightings.length() > 0 ? sightings.getJSONObject(0).optString("at") : "";
            long total = r.optLong("total");
            JSONObject before = seen.optJSONObject(code);
            if (before != null) {
                // ISO zamanları aynı biçimde geldiği için metin karşılaştırması yeterli
                if (!lastSighting.isEmpty() && lastSighting.compareTo(before.optString("sighting")) > 0) {
                    post(this, CH_FOUND, 3000 + Math.abs(code.hashCode() % 1000), "📍 " + who + " için yeni konum geldi",
                            "Biri bulunduğu yeri gönderdi. Haritada görmek için dokunun; bulan kişi sizi arayabilir de.", open(this, "#kunye/" + code));
                } else if (r.optBoolean("lost") && total > before.optLong("total")) {
                    post(this, CH_FOUND, 4000 + Math.abs(code.hashCode() % 1000), "🐾 " + who + "'in rozeti okutuldu",
                            "Kayıp modu açık: biri rozeti az önce okuttu. Telefonunuzu yakınınızda tutun.", open(this, "#kunye/" + code));
                }
            }
            seen.put(code, new JSONObject().put("sighting", lastSighting).put("total", total));  // ilk görüşte bildirim yok
        }
        p.edit().putString("seen", seen.toString()).apply();
    }

    // ---------------------------------------------------------------- sipariş durumu
    private void checkOrders() throws Exception {
        SharedPreferences p = prefs(this);
        JSONArray known = new JSONArray(p.getString("orders", "[]"));
        if (known.length() == 0) return;
        JSONArray codes = new JSONArray(), tokens = new JSONArray();
        for (int i = 0; i < known.length(); i++) {
            JSONObject o = known.getJSONObject(i);
            codes.put(o.optString("code"));
            tokens.put(o.optString("token"));
        }
        JSONObject args = new JSONObject().put("p_codes", codes).put("p_tokens", tokens);
        JSONArray rows = new JSONArray(http("POST", SUPABASE_URL + "/rest/v1/rpc/tasma_order_status", args.toString(), true));
        boolean changed = false;
        for (int i = 0; i < rows.length(); i++) {
            JSONObject r = rows.getJSONObject(i);
            JSONObject o = find(known, r.optString("code"));
            if (o == null) continue;
            String status = r.optString("status"), tracking = r.isNull("tracking") ? "" : r.optString("tracking");
            String text = statusChange(o.optString("status"), status, tracking);
            if (text != null) {
                post(this, CH_ORDERS, 2000 + Math.abs(o.optString("code").hashCode() % 1000), "Sipariş " + o.optString("code"), text,
                        open(this, "#odeme/" + o.optString("code")));
            }
            if (!status.equals(o.optString("status"))) { o.put("status", status); changed = true; }
        }
        if (changed) p.edit().putString("orders", known.toString()).apply();
    }

    /** Durum ilerlediyse gösterilecek metin; değişmediyse null. */
    static String statusChange(String before, String after, String tracking) {
        if (after == null || after.isEmpty() || after.equals(before)) return null;
        switch (after) {
            case "onaylandi": return "Ödemeniz alındı, rozetiniz üretime hazırlanıyor.";
            case "baskida": return "Rozetiniz üretimde.";
            case "kargolandi": return "Rozetiniz kargoya verildi." + (tracking.isEmpty() ? "" : " Takip no: " + tracking);
            case "iptal": return "Siparişiniz iptal edildi.";
            default: return null;  // ilk durumlar için bildirim yok
        }
    }

    // ---------------------------------------------------------------- yeni sürüm (yalnızca elden kurulan APK)
    private void checkUpdate() throws Exception {
        long installed = getPackageManager().getPackageInfo(getPackageName(), 0).getLongVersionCode();
        long latest = latestBuild(new JSONObject(http("GET", RELEASE_API, null, false)).optString("body"));
        SharedPreferences p = prefs(this);
        if (latest > installed && latest > p.getLong("notifiedVersion", 0)) {
            Intent open = new Intent(Intent.ACTION_VIEW, Uri.parse(APK_URL + "?v=" + latest));
            post(this, CH_UPDATE, 1000, "Tasma QR'ın yeni sürümü hazır", "Sürüm 1.0." + latest + " · Güncellemek için dokunun, inen dosyayı açın.", open);
            p.edit().putLong("notifiedVersion", latest).apply();
        }
    }

    /** GitHub sürüm notundaki "Derleme N" sayısı; yoksa 0. */
    static long latestBuild(String releaseBody) {
        Matcher m = Pattern.compile("Derleme (\\d+)").matcher(releaseBody == null ? "" : releaseBody);
        return m.find() ? Long.parseLong(m.group(1)) : 0;
    }

    // ---------------------------------------------------------------- yardımcılar
    private static Intent open(Context ctx, String route) {
        Intent i = new Intent(ctx, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return route == null ? i : i.putExtra(EXTRA_ROUTE, route);
    }

    private static JSONObject find(JSONArray list, String code) throws Exception {
        for (int i = 0; i < list.length(); i++) if (list.getJSONObject(i).optString("code").equals(code)) return list.getJSONObject(i);
        return null;
    }

    /** Bildirim izni verilmiş ve bildirimler kapatılmamış mı */
    static boolean enabled(Context ctx) {
        NotificationManager nm = ctx.getSystemService(NotificationManager.class);
        if (nm == null || !nm.areNotificationsEnabled()) return false;
        return Build.VERSION.SDK_INT < 33 || ctx.checkSelfPermission("android.permission.POST_NOTIFICATIONS") == PackageManager.PERMISSION_GRANTED;
    }

    private static boolean post(Context ctx, String channel, int id, String title, String text, Intent tap) {
        NotificationManager nm = ctx.getSystemService(NotificationManager.class);
        if (nm == null || !enabled(ctx)) return false;
        nm.createNotificationChannel(new NotificationChannel(CH_FOUND, "Dostum bulundu (konum, okutma)", NotificationManager.IMPORTANCE_HIGH));
        nm.createNotificationChannel(new NotificationChannel(CH_ORDERS, "Sipariş durumu", NotificationManager.IMPORTANCE_DEFAULT));
        nm.createNotificationChannel(new NotificationChannel(CH_UPDATE, "Uygulama", NotificationManager.IMPORTANCE_DEFAULT));
        PendingIntent pi = PendingIntent.getActivity(ctx, id, tap, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification n = new Notification.Builder(ctx, channel)
                .setSmallIcon(R.drawable.ic_notification)
                .setColor(0xFFB8501A)
                .setContentTitle(title)
                .setContentText(text)
                .setStyle(new Notification.BigTextStyle().bigText(text))
                .setContentIntent(pi)
                .setAutoCancel(true)
                .build();
        nm.notify(id, n);
        return true;
    }

    private static SharedPreferences prefs(Context ctx) {
        return ctx.getSharedPreferences(PREFS, MODE_PRIVATE);
    }

    private static String http(String method, String url, String body, boolean supabase) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setRequestMethod(method);
        c.setConnectTimeout(15000);
        c.setReadTimeout(15000);
        c.setRequestProperty("Accept", "application/json");
        if (supabase) {
            c.setRequestProperty("apikey", SUPABASE_KEY);
            if (SUPABASE_KEY.startsWith("eyJ")) c.setRequestProperty("Authorization", "Bearer " + SUPABASE_KEY);
        }
        if (body != null) {
            c.setDoOutput(true);
            c.setRequestProperty("Content-Type", "application/json");
            try (OutputStream out = c.getOutputStream()) { out.write(body.getBytes(StandardCharsets.UTF_8)); }
        }
        if (c.getResponseCode() >= 400) throw new IllegalStateException("HTTP " + c.getResponseCode());
        try (InputStream in = c.getInputStream(); ByteArrayOutputStream buf = new ByteArrayOutputStream()) {
            byte[] b = new byte[8192];
            for (int n; (n = in.read(b)) > 0; ) buf.write(b, 0, n);
            return buf.toString(StandardCharsets.UTF_8.name());
        } finally {
            c.disconnect();
        }
    }
}
