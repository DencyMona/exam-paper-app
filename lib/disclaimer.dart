import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lanka_ex_papers/academic_list_page.dart';

class DisclaimerPage extends StatelessWidget {
  const DisclaimerPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 60),

              // Header
              Text(
                "Disclaimer",
                style: GoogleFonts.merriweather(
                  textStyle: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF4C24C7),
                  ),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 30),

              // Content
              Expanded(
                child: SingleChildScrollView(
                  child: Text(
                    "All past papers and materials listed in this app are linked from publicly available sources or uploaded by users. "
                    "We do not claim ownership of any copyrighted material.\n\n"
                    "If you are the copyright owner of any content "
                    "and wish it removed, please contact us at:\n\n"
                    "njnpiratheep3@gmail.com\n\n"
                    "We will promptly review and remove the content if required.",
                    style: GoogleFonts.poppins(
                      textStyle: const TextStyle(
                        fontSize: 16,
                        height: 1.6,
                        color: Colors.black87,
                      ),
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),

              const SizedBox(height: 40),

              // Button
              Center(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4C24C7),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 40,
                      vertical: 14,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(40),
                    ),
                    elevation: 6,
                    shadowColor: const Color(0xFF4C24C7).withOpacity(0.4),
                  ),
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const AcademicListPage(),
                      ),
                    );
                  },
                  child: Text(
                    "I Understand",
                    style: GoogleFonts.poppins(
                      textStyle: const TextStyle(
                        fontSize: 18,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.1,
                      ),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
