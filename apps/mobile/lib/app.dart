import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/l10n/generated/app_localizations.dart';
import 'core/providers.dart';
import 'core/theme/app_theme.dart';
import 'features/shell/app_shell.dart';
import 'features/splash/splash_screen.dart';

class TrinetraApp extends ConsumerStatefulWidget {
  const TrinetraApp({this.showSplash = true, super.key});

  final bool showSplash;

  @override
  ConsumerState<TrinetraApp> createState() => _TrinetraAppState();
}

class _TrinetraAppState extends ConsumerState<TrinetraApp> {
  late bool _splash;

  @override
  void initState() {
    super.initState();
    _splash = widget.showSplash;
    if (_splash) {
      Future<void>.delayed(const Duration(milliseconds: 1100), () {
        if (mounted) setState(() => _splash = false);
      });
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      ref.read(pushServiceProvider).start();
    });
  }

  @override
  Widget build(BuildContext context) {
    final locale = ref.watch(localeProvider);
    return MaterialApp(
      title: 'Trinetra',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      locale: locale,
      supportedLocales: AppLocalizations.supportedLocales,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      builder: (context, child) {
        return Stack(
          fit: StackFit.expand,
          children: [
            child ?? const SizedBox.shrink(),
            if (_splash) const SplashScreen(),
          ],
        );
      },
      home: const AppShell(),
    );
  }
}
