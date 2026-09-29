import 'package:flutter/material.dart';

class AppTheme {
  // Signature Lavender & Dark Slate Palette
  static const Color brandLavender = Color(0xFF8B82F6);
  static const Color brandLavenderDark = Color(0xFF6E68B8);
  static const Color brandLavenderLight = Color(0xFFEEEDFE);
  
  static const Color brandChampagne = Color(0xFFEDE6DC);
  static const Color brandChampagneLight = Color(0xFFFBF8F5);

  static const Color darkSlate = Color(0xFF18181F);
  static const Color darkSlateCard = Color(0xFF20202A);
  
  static const Color background = Color(0xFFF4F5F9);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceMuted = Color(0xFFF0F1F7);
  
  static const Color textPrimary = Color(0xFF14141E);
  static const Color textSecondary = Color(0xFF4B4B5E);
  static const Color textMuted = Color(0xFF9696A6);
  
  static const Color border = Color(0xFFEAEBF2);
  static const Color successEmerald = Color(0xFF10B981);
  static const Color warningAmber = Color(0xFFF59E0B);
  static const Color dangerRed = Color(0xFFEF4444);

  // Blinkit Signature Yellow & Green Accents
  static const Color blinkitYellow = Color(0xFFF7D154);
  static const Color blinkitGreen = Color(0xFF0C831F);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: background,
      primaryColor: brandLavender,
      colorScheme: ColorScheme.fromSeed(
        seedColor: brandLavender,
        primary: brandLavender,
        surface: surface,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: textPrimary),
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
