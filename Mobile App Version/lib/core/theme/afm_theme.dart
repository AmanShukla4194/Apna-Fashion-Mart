import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// ---------------------------------------------------------------------------
// Brand colour palette
// ---------------------------------------------------------------------------
abstract class AfmColors {
  static const navy900 = Color(0xFF001428);
  static const navy800 = Color(0xFF001F3F);
  static const navy700 = Color(0xFF11375E);
  static const navy600 = Color(0xFF1A4A7A);
  static const navy100 = Color(0xFFE8EFF7);

  static const magenta600 = Color(0xFFFF1493);
  static const magenta500 = Color(0xFFFF55B0);
  static const magenta400 = Color(0xFFFF88C8);
  static const magenta100 = Color(0xFFFFEDF7);

  static const gold500 = Color(0xFFC9A24A);
  static const gold400 = Color(0xFFE8C96A);
  static const gold100 = Color(0xFFFFF8E7);

  static const verified500 = Color(0xFF1DA1F2);
  static const success500 = Color(0xFF0E7C4D);
  static const success100 = Color(0xFFE6F7F0);
  static const danger500 = Color(0xFFDC2626);
  static const danger100 = Color(0xFFFEF2F2);
  static const warning500 = Color(0xFFF59E0B);
  static const warning100 = Color(0xFFFFFBEB);

  static const neutral50 = Color(0xFFF8F9FB);
  static const neutral100 = Color(0xFFF1F3F6);
  static const neutral200 = Color(0xFFE4E7EC);
  static const neutral300 = Color(0xFFCDD3DC);
  static const neutral400 = Color(0xFF9CA3AF);
  static const neutral500 = Color(0xFF6B7280);
  static const neutral600 = Color(0xFF4B5563);
  static const neutral700 = Color(0xFF2F3A4A);
  static const neutral800 = Color(0xFF1B2230);
  static const neutral900 = Color(0xFF0B0F18);
}

// ---------------------------------------------------------------------------
// Brand gradients
// ---------------------------------------------------------------------------
const LinearGradient afmGradient = LinearGradient(
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
  colors: [
    AfmColors.navy800,
    Color(0xFF6D1B5C),
    AfmColors.magenta600,
  ],
);

const LinearGradient afmGoldGradient = LinearGradient(
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
  colors: [
    AfmColors.gold500,
    AfmColors.gold400,
  ],
);

const LinearGradient afmNavyGradient = LinearGradient(
  begin: Alignment.topCenter,
  end: Alignment.bottomCenter,
  colors: [
    AfmColors.navy900,
    AfmColors.navy800,
  ],
);

// ---------------------------------------------------------------------------
// Light theme
// ---------------------------------------------------------------------------
ThemeData afmLightTheme() {
  final base = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: const ColorScheme.light(
      primary: AfmColors.navy800,
      onPrimary: Colors.white,
      primaryContainer: AfmColors.navy100,
      onPrimaryContainer: AfmColors.navy800,
      secondary: AfmColors.magenta600,
      onSecondary: Colors.white,
      secondaryContainer: AfmColors.magenta100,
      onSecondaryContainer: AfmColors.magenta600,
      tertiary: AfmColors.gold500,
      onTertiary: Colors.white,
      tertiaryContainer: AfmColors.gold100,
      onTertiaryContainer: AfmColors.gold500,
      error: AfmColors.danger500,
      onError: Colors.white,
      surface: Colors.white,
      onSurface: AfmColors.neutral900,
      surfaceContainerHighest: AfmColors.neutral100,
      outline: AfmColors.neutral300,
      outlineVariant: AfmColors.neutral200,
    ),
  );

  final textTheme = GoogleFonts.poppinsTextTheme(base.textTheme).copyWith(
    displayLarge: GoogleFonts.playfairDisplay(
      fontSize: 57,
      fontWeight: FontWeight.w700,
      color: AfmColors.navy800,
    ),
    displayMedium: GoogleFonts.playfairDisplay(
      fontSize: 45,
      fontWeight: FontWeight.w700,
      color: AfmColors.navy800,
    ),
    displaySmall: GoogleFonts.playfairDisplay(
      fontSize: 36,
      fontWeight: FontWeight.w600,
      color: AfmColors.navy800,
    ),
    headlineLarge: GoogleFonts.playfairDisplay(
      fontSize: 32,
      fontWeight: FontWeight.w700,
      color: AfmColors.navy800,
    ),
    headlineMedium: GoogleFonts.playfairDisplay(
      fontSize: 28,
      fontWeight: FontWeight.w600,
      color: AfmColors.navy800,
    ),
    headlineSmall: GoogleFonts.playfairDisplay(
      fontSize: 24,
      fontWeight: FontWeight.w600,
      color: AfmColors.navy800,
    ),
    titleLarge: GoogleFonts.poppins(
      fontSize: 22,
      fontWeight: FontWeight.w600,
      color: AfmColors.neutral900,
    ),
    titleMedium: GoogleFonts.poppins(
      fontSize: 16,
      fontWeight: FontWeight.w600,
      color: AfmColors.neutral900,
    ),
    titleSmall: GoogleFonts.poppins(
      fontSize: 14,
      fontWeight: FontWeight.w600,
      color: AfmColors.neutral900,
    ),
    bodyLarge: GoogleFonts.poppins(
      fontSize: 16,
      fontWeight: FontWeight.w400,
      color: AfmColors.neutral800,
    ),
    bodyMedium: GoogleFonts.poppins(
      fontSize: 14,
      fontWeight: FontWeight.w400,
      color: AfmColors.neutral700,
    ),
    bodySmall: GoogleFonts.poppins(
      fontSize: 12,
      fontWeight: FontWeight.w400,
      color: AfmColors.neutral500,
    ),
    labelLarge: GoogleFonts.poppins(
      fontSize: 14,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.5,
      color: AfmColors.neutral900,
    ),
    labelMedium: GoogleFonts.poppins(
      fontSize: 12,
      fontWeight: FontWeight.w500,
      letterSpacing: 0.5,
      color: AfmColors.neutral700,
    ),
    labelSmall: GoogleFonts.poppins(
      fontSize: 10,
      fontWeight: FontWeight.w500,
      letterSpacing: 0.5,
      color: AfmColors.neutral500,
    ),
  );

  return base.copyWith(
    textTheme: textTheme,
    appBarTheme: AppBarTheme(
      backgroundColor: AfmColors.navy800,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: textTheme.titleLarge?.copyWith(color: Colors.white),
      iconTheme: const IconThemeData(color: Colors.white),
      actionsIconTheme: const IconThemeData(color: Colors.white),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AfmColors.magenta600,
        foregroundColor: Colors.white,
        minimumSize: const Size(double.infinity, 52),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        textStyle: textTheme.labelLarge?.copyWith(color: Colors.white),
        elevation: 0,
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AfmColors.navy800,
        minimumSize: const Size(double.infinity, 52),
        side: const BorderSide(color: AfmColors.navy800, width: 1.5),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        textStyle: textTheme.labelLarge,
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AfmColors.magenta600,
        textStyle: textTheme.labelLarge?.copyWith(color: AfmColors.magenta600),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AfmColors.neutral50,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AfmColors.neutral200),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AfmColors.neutral200),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AfmColors.navy800, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AfmColors.danger500),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AfmColors.danger500, width: 1.5),
      ),
      labelStyle: textTheme.bodyMedium,
      hintStyle:
          textTheme.bodyMedium?.copyWith(color: AfmColors.neutral400),
    ),
    cardTheme: CardThemeData(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AfmColors.neutral200),
      ),
      clipBehavior: Clip.antiAlias,
    ),
    chipTheme: ChipThemeData(
      backgroundColor: AfmColors.neutral100,
      selectedColor: AfmColors.navy800,
      labelStyle: textTheme.labelSmall,
      side: BorderSide.none,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
    ),
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: Colors.white,
      selectedItemColor: AfmColors.navy800,
      unselectedItemColor: AfmColors.neutral400,
      selectedLabelStyle: textTheme.labelSmall
          ?.copyWith(color: AfmColors.navy800, fontWeight: FontWeight.w600),
      unselectedLabelStyle: textTheme.labelSmall,
      type: BottomNavigationBarType.fixed,
      elevation: 12,
    ),
    dividerTheme: const DividerThemeData(
      color: AfmColors.neutral200,
      thickness: 1,
      space: 1,
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: AfmColors.navy800,
      contentTextStyle: textTheme.bodyMedium?.copyWith(color: Colors.white),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    ),
    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: AfmColors.magenta600,
    ),
    scaffoldBackgroundColor: AfmColors.neutral50,
  );
}

// ---------------------------------------------------------------------------
// Dark theme
// ---------------------------------------------------------------------------
ThemeData afmDarkTheme() {
  final base = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: const ColorScheme.dark(
      primary: AfmColors.magenta500,
      onPrimary: AfmColors.navy900,
      primaryContainer: AfmColors.navy700,
      onPrimaryContainer: AfmColors.magenta400,
      secondary: AfmColors.magenta400,
      onSecondary: AfmColors.navy900,
      secondaryContainer: Color(0xFF3D0028),
      onSecondaryContainer: AfmColors.magenta400,
      tertiary: AfmColors.gold400,
      onTertiary: AfmColors.navy900,
      tertiaryContainer: Color(0xFF3D2A00),
      onTertiaryContainer: AfmColors.gold400,
      error: Color(0xFFFF6B6B),
      onError: AfmColors.navy900,
      surface: AfmColors.neutral800,
      onSurface: AfmColors.neutral50,
      surfaceContainerHighest: AfmColors.neutral700,
      outline: AfmColors.neutral600,
      outlineVariant: AfmColors.neutral700,
    ),
  );

  final textTheme = GoogleFonts.poppinsTextTheme(base.textTheme).copyWith(
    displayLarge: GoogleFonts.playfairDisplay(
      fontSize: 57,
      fontWeight: FontWeight.w700,
      color: Colors.white,
    ),
    headlineLarge: GoogleFonts.playfairDisplay(
      fontSize: 32,
      fontWeight: FontWeight.w700,
      color: Colors.white,
    ),
    headlineMedium: GoogleFonts.playfairDisplay(
      fontSize: 28,
      fontWeight: FontWeight.w600,
      color: Colors.white,
    ),
    headlineSmall: GoogleFonts.playfairDisplay(
      fontSize: 24,
      fontWeight: FontWeight.w600,
      color: Colors.white,
    ),
    titleLarge: GoogleFonts.poppins(
      fontSize: 22,
      fontWeight: FontWeight.w600,
      color: Colors.white,
    ),
    titleMedium: GoogleFonts.poppins(
      fontSize: 16,
      fontWeight: FontWeight.w600,
      color: AfmColors.neutral50,
    ),
    bodyLarge: GoogleFonts.poppins(
      fontSize: 16,
      fontWeight: FontWeight.w400,
      color: AfmColors.neutral100,
    ),
    bodyMedium: GoogleFonts.poppins(
      fontSize: 14,
      fontWeight: FontWeight.w400,
      color: AfmColors.neutral200,
    ),
    bodySmall: GoogleFonts.poppins(
      fontSize: 12,
      fontWeight: FontWeight.w400,
      color: AfmColors.neutral400,
    ),
    labelLarge: GoogleFonts.poppins(
      fontSize: 14,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.5,
      color: AfmColors.neutral50,
    ),
    labelSmall: GoogleFonts.poppins(
      fontSize: 10,
      fontWeight: FontWeight.w500,
      letterSpacing: 0.5,
      color: AfmColors.neutral400,
    ),
  );

  return base.copyWith(
    textTheme: textTheme,
    appBarTheme: AppBarTheme(
      backgroundColor: AfmColors.navy900,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: textTheme.titleLarge?.copyWith(color: Colors.white),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AfmColors.magenta500,
        foregroundColor: AfmColors.navy900,
        minimumSize: const Size(double.infinity, 52),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 0,
      ),
    ),
    cardTheme: CardThemeData(
      color: AfmColors.neutral800,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AfmColors.neutral700),
      ),
      clipBehavior: Clip.antiAlias,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AfmColors.neutral800,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AfmColors.neutral600),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AfmColors.neutral600),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide:
            const BorderSide(color: AfmColors.magenta500, width: 1.5),
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AfmColors.neutral900,
      selectedItemColor: AfmColors.magenta500,
      unselectedItemColor: AfmColors.neutral500,
      type: BottomNavigationBarType.fixed,
      elevation: 12,
    ),
    scaffoldBackgroundColor: AfmColors.neutral900,
    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: AfmColors.magenta500,
    ),
  );
}
