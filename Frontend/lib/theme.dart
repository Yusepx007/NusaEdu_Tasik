import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

const Color primaryColor = Color(0xFF00696A);   // Teal
const Color secondaryColor = Color(0xFFE56E24); // Orange
const Color backgroundColor = Color(0xFFF5F6FA);

final appTheme = ThemeData(
  colorScheme: ColorScheme.fromSeed(
    seedColor: primaryColor,
    primary: primaryColor,
    secondary: secondaryColor,
  ),
  scaffoldBackgroundColor: backgroundColor,
  textTheme: GoogleFonts.poppinsTextTheme(),
  appBarTheme: AppBarTheme(
    elevation: 0,
    backgroundColor: primaryColor,
    foregroundColor: Colors.white,
    centerTitle: true,
    titleTextStyle: GoogleFonts.poppins(
      color: Colors.white,
      fontSize: 18,
      fontWeight: FontWeight.w600,
    ),
    iconTheme: const IconThemeData(color: Colors.white),
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: primaryColor,
      foregroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      minimumSize: const Size(double.infinity, 50),
      textStyle: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 16),
    ),
  ),
);
