import 'package:flutter/material.dart';
import 'package:scan_wisata/theme.dart';

enum ButtonType { primary, secondary, outline }

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isOutlined;
  final ButtonType type;
  final bool isPill;
  final double? width;

  const CustomButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isOutlined = false,
    this.type = ButtonType.primary,
    this.isPill = false,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    Color getBgColor() {
      if (isOutlined) return Colors.white;
      if (type == ButtonType.secondary) return secondaryColor;
      return primaryColor;
    }

    Color getFgColor() {
      if (isOutlined) {
        if (type == ButtonType.secondary) return secondaryColor;
        return primaryColor;
      }
      return Colors.white;
    }

    final shape = isPill
        ? const StadiumBorder()
        : RoundedRectangleBorder(borderRadius: BorderRadius.circular(12));

    final minSize = Size(width ?? double.infinity, 50);

    if (isOutlined) {
      return OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          minimumSize: minSize,
          side: BorderSide(color: getFgColor()),
          shape: shape,
        ),
        child: Text(text, style: TextStyle(color: getFgColor(), fontSize: 16)),
      );
    }

    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        minimumSize: minSize,
        backgroundColor: getBgColor(),
        foregroundColor: getFgColor(),
        shape: shape,
      ),
      child: Text(text, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
    );
  }
}
