import 'package:flutter/material.dart';

import '../../core/theme/afm_theme.dart';

enum AfmButtonVariant { primary, ghost, light, onDark }
enum AfmButtonSize { small, normal, large }

class AfmButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final AfmButtonVariant variant;
  final AfmButtonSize size;
  final bool isLoading;
  final bool fullWidth;
  final Widget? leading;
  final Widget? trailing;
  final IconData? icon;

  const AfmButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = AfmButtonVariant.primary,
    this.size = AfmButtonSize.normal,
    this.isLoading = false,
    this.fullWidth = true,
    this.leading,
    this.trailing,
    this.icon,
  });

  // Convenience constructors
  const AfmButton.ghost({
    super.key,
    required this.label,
    required this.onPressed,
    this.size = AfmButtonSize.normal,
    this.isLoading = false,
    this.fullWidth = true,
    this.leading,
    this.trailing,
    this.icon,
  }) : variant = AfmButtonVariant.ghost;

  const AfmButton.light({
    super.key,
    required this.label,
    required this.onPressed,
    this.size = AfmButtonSize.normal,
    this.isLoading = false,
    this.fullWidth = true,
    this.leading,
    this.trailing,
    this.icon,
  }) : variant = AfmButtonVariant.light;

  const AfmButton.onDark({
    super.key,
    required this.label,
    required this.onPressed,
    this.size = AfmButtonSize.normal,
    this.isLoading = false,
    this.fullWidth = true,
    this.leading,
    this.trailing,
    this.icon,
  }) : variant = AfmButtonVariant.onDark;

  double get _height {
    switch (size) {
      case AfmButtonSize.small:
        return 40;
      case AfmButtonSize.large:
        return 60;
      case AfmButtonSize.normal:
        return 52;
    }
  }

  double get _fontSize {
    switch (size) {
      case AfmButtonSize.small:
        return 13;
      case AfmButtonSize.large:
        return 16;
      case AfmButtonSize.normal:
        return 14;
    }
  }

  EdgeInsets get _padding {
    switch (size) {
      case AfmButtonSize.small:
        return const EdgeInsets.symmetric(horizontal: 16);
      case AfmButtonSize.large:
        return const EdgeInsets.symmetric(horizontal: 32);
      case AfmButtonSize.normal:
        return const EdgeInsets.symmetric(horizontal: 24);
    }
  }

  @override
  Widget build(BuildContext context) {
    Widget button;

    switch (variant) {
      case AfmButtonVariant.primary:
        button = _PrimaryButton(
          label: label,
          onPressed: isLoading ? null : onPressed,
          height: _height,
          fontSize: _fontSize,
          padding: _padding,
          isLoading: isLoading,
          leading: leading,
          trailing: trailing,
          icon: icon,
        );
      case AfmButtonVariant.ghost:
        button = _GhostButton(
          label: label,
          onPressed: isLoading ? null : onPressed,
          height: _height,
          fontSize: _fontSize,
          padding: _padding,
          isLoading: isLoading,
          leading: leading,
          trailing: trailing,
          icon: icon,
        );
      case AfmButtonVariant.light:
        button = _LightButton(
          label: label,
          onPressed: isLoading ? null : onPressed,
          height: _height,
          fontSize: _fontSize,
          padding: _padding,
          isLoading: isLoading,
          leading: leading,
          trailing: trailing,
          icon: icon,
        );
      case AfmButtonVariant.onDark:
        button = _OnDarkButton(
          label: label,
          onPressed: isLoading ? null : onPressed,
          height: _height,
          fontSize: _fontSize,
          padding: _padding,
          isLoading: isLoading,
          leading: leading,
          trailing: trailing,
          icon: icon,
        );
    }

    if (fullWidth) {
      return SizedBox(width: double.infinity, child: button);
    }
    return button;
  }
}

// ---------------------------------------------------------------------------
// Primary – magenta gradient
// ---------------------------------------------------------------------------
class _PrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final double height;
  final double fontSize;
  final EdgeInsets padding;
  final bool isLoading;
  final Widget? leading;
  final Widget? trailing;
  final IconData? icon;

  const _PrimaryButton({
    required this.label,
    required this.onPressed,
    required this.height,
    required this.fontSize,
    required this.padding,
    required this.isLoading,
    this.leading,
    this.trailing,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        gradient: onPressed == null
            ? null
            : const LinearGradient(
                colors: [AfmColors.magenta600, Color(0xFFD4006A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
        color: onPressed == null ? AfmColors.neutral300 : null,
        borderRadius: BorderRadius.circular(12),
        boxShadow: onPressed == null
            ? null
            : [
                BoxShadow(
                  color: AfmColors.magenta600.withAlpha(77),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: padding,
            child: _ButtonContent(
              label: label,
              fontSize: fontSize,
              color: Colors.white,
              isLoading: isLoading,
              leading: leading,
              trailing: trailing,
              icon: icon,
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Ghost – outlined navy
// ---------------------------------------------------------------------------
class _GhostButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final double height;
  final double fontSize;
  final EdgeInsets padding;
  final bool isLoading;
  final Widget? leading;
  final Widget? trailing;
  final IconData? icon;

  const _GhostButton({
    required this.label,
    required this.onPressed,
    required this.height,
    required this.fontSize,
    required this.padding,
    required this.isLoading,
    this.leading,
    this.trailing,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          foregroundColor: AfmColors.navy800,
          side: const BorderSide(color: AfmColors.navy800, width: 1.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: padding,
        ),
        child: _ButtonContent(
          label: label,
          fontSize: fontSize,
          color: AfmColors.navy800,
          isLoading: isLoading,
          leading: leading,
          trailing: trailing,
          icon: icon,
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Light – neutral background
// ---------------------------------------------------------------------------
class _LightButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final double height;
  final double fontSize;
  final EdgeInsets padding;
  final bool isLoading;
  final Widget? leading;
  final Widget? trailing;
  final IconData? icon;

  const _LightButton({
    required this.label,
    required this.onPressed,
    required this.height,
    required this.fontSize,
    required this.padding,
    required this.isLoading,
    this.leading,
    this.trailing,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AfmColors.neutral100,
          foregroundColor: AfmColors.navy800,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: padding,
        ),
        child: _ButtonContent(
          label: label,
          fontSize: fontSize,
          color: AfmColors.navy800,
          isLoading: isLoading,
          leading: leading,
          trailing: trailing,
          icon: icon,
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// OnDark – white with transparent background for dark surfaces
// ---------------------------------------------------------------------------
class _OnDarkButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final double height;
  final double fontSize;
  final EdgeInsets padding;
  final bool isLoading;
  final Widget? leading;
  final Widget? trailing;
  final IconData? icon;

  const _OnDarkButton({
    required this.label,
    required this.onPressed,
    required this.height,
    required this.fontSize,
    required this.padding,
    required this.isLoading,
    this.leading,
    this.trailing,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          foregroundColor: Colors.white,
          side: const BorderSide(color: Colors.white, width: 1.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: padding,
        ),
        child: _ButtonContent(
          label: label,
          fontSize: fontSize,
          color: Colors.white,
          isLoading: isLoading,
          leading: leading,
          trailing: trailing,
          icon: icon,
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Shared button content (label + optional icon/leading/trailing + spinner)
// ---------------------------------------------------------------------------
class _ButtonContent extends StatelessWidget {
  final String label;
  final double fontSize;
  final Color color;
  final bool isLoading;
  final Widget? leading;
  final Widget? trailing;
  final IconData? icon;

  const _ButtonContent({
    required this.label,
    required this.fontSize,
    required this.color,
    required this.isLoading,
    this.leading,
    this.trailing,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return SizedBox(
        width: 20,
        height: 20,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(color),
        ),
      );
    }

    final children = <Widget>[];

    if (leading != null) {
      children.add(leading!);
      children.add(const SizedBox(width: 8));
    } else if (icon != null) {
      children.add(Icon(icon, size: fontSize + 2, color: color));
      children.add(const SizedBox(width: 8));
    }

    children.add(
      Text(
        label,
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: FontWeight.w600,
          color: color,
          letterSpacing: 0.3,
        ),
      ),
    );

    if (trailing != null) {
      children.add(const SizedBox(width: 8));
      children.add(trailing!);
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: children,
    );
  }
}
