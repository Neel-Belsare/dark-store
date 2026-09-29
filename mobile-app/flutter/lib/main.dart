import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'providers/cart_provider.dart';
import 'providers/location_provider.dart';
import 'providers/rider_provider.dart';
import 'screens/home_catalog_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set clean status bar styling
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => LocationProvider()),
        ChangeNotifierProvider(create: (_) => RiderProvider()),
      ],
      child: const BlinkitQuickCommerceApp(),
    ),
  );
}

class BlinkitQuickCommerceApp extends StatelessWidget {
  const BlinkitQuickCommerceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Blinkit Quick-Commerce (v4.0.0)',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const HomeCatalogScreen(),
    );
  }
}
