# Proguard rules for The School ERP
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keep class com.theschool.erp.SchoolWebAppInterface {
    public *;
}
