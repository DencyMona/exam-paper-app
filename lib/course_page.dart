import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'pastpaper_page.dart';
import 'services/api_service.dart';

class CoursePage extends StatefulWidget {
  final String academicName;
  final int academicId;

  const CoursePage({
    super.key,
    required this.academicName,
    required this.academicId,
  });

  @override
  CoursePageState createState() => CoursePageState();
}

class CoursePageState extends State<CoursePage> {
  List<dynamic> courses = [];
  List<dynamic> years = [];
  List<dynamic> subjects = [];
  List<dynamic> filteredSubjects = [];

  int? selectedCourseId;
  int? selectedYearId;
  String query = "";

  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    fetchCourses();
  }

  Future<void> fetchCourses() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });
    try {
      final data = await ApiService.fetchCourses(widget.academicId);
      setState(() {
        courses = data;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = "Failed to fetch courses.";
      });
      debugPrint("Error fetching courses: $e");
    }
  }

  Future<void> fetchYears(int courseId) async {
    setState(() {
      isLoading = true;
      errorMessage = null;
      years = [];
      subjects = [];
      filteredSubjects = [];
      selectedYearId = null;
      query = "";
    });
    try {
      final data = await ApiService.fetchYears(courseId);
      setState(() {
        years = data;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = "Failed to fetch years.";
      });
      debugPrint("Error fetching years: $e");
    }
  }

  Future<void> fetchSubjects(int yearId) async {
    setState(() {
      isLoading = true;
      errorMessage = null;
      subjects = [];
      filteredSubjects = [];
      query = "";
    });
    try {
      final data = await ApiService.fetchSubjects(yearId);
      setState(() {
        subjects = data;
        filteredSubjects = data;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = "Failed to fetch subjects.";
      });
      debugPrint("Error fetching subjects: $e");
    }
  }

  void filterSubjects(String value) {
    setState(() {
      query = value;
      filteredSubjects = subjects
          .where(
            (subject) => subject["subject_name"].toLowerCase().contains(
              query.toLowerCase(),
            ),
          )
          .toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: Row(
          children: [
            IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.deepPurple),
              onPressed: () => Navigator.pop(context),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                "Courses for ${widget.academicName}",
                style: GoogleFonts.robotoSlab(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF4C24C7),
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : errorMessage != null
            ? Center(
                child: Text(
                  errorMessage!,
                  style: const TextStyle(color: Colors.red, fontSize: 16),
                ),
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Course
                  Text(
                    "Select Course",
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.deepPurple.shade700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                    elevation: 3,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: DropdownButtonFormField<int>(
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                        ),
                        initialValue: selectedCourseId,
                        hint: const Text(
                          "Choose Course",
                          style: TextStyle(fontSize: 16, color: Colors.grey),
                        ),
                        items: courses
                            .map(
                              (course) => DropdownMenuItem<int>(
                                value: course["course_id"],
                                child: Text(
                                  course["course_name"],
                                  style: const TextStyle(fontSize: 16),
                                ),
                              ),
                            )
                            .toList(),
                        onChanged: (value) {
                          setState(() {
                            selectedCourseId = value;
                            selectedYearId = null;
                            subjects = [];
                            filteredSubjects = [];
                          });
                          if (value != null) fetchYears(value);
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Year
                  if (years.isNotEmpty) ...[
                    Text(
                      "Select Year",
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.deepPurple.shade700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Card(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                      elevation: 3,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: DropdownButtonFormField<int>(
                          decoration: const InputDecoration(
                            border: InputBorder.none,
                          ),
                          initialValue: selectedYearId,
                          hint: const Text(
                            "Choose Year",
                            style: TextStyle(fontSize: 16, color: Colors.grey),
                          ),
                          items: years
                              .map(
                                (year) => DropdownMenuItem<int>(
                                  value: year["year_id"],
                                  child: Text(
                                    year["year_name"],
                                    style: const TextStyle(fontSize: 16),
                                  ),
                                ),
                              )
                              .toList(),
                          onChanged: (value) {
                            setState(() {
                              selectedYearId = value;
                              filteredSubjects = [];
                            });
                            if (value != null) fetchSubjects(value);
                          },
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),

                  // Subject Search
                  if (subjects.isNotEmpty)
                    TextField(
                      onChanged: filterSubjects,
                      decoration: InputDecoration(
                        hintText: "Search...",
                        filled: true,
                        fillColor: Colors.grey.shade100,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 12,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(25),
                          borderSide: BorderSide.none,
                        ),
                        suffixIcon: Icon(
                          Icons.search,
                          color: Colors.deepPurple.shade700,
                        ),
                      ),
                    ),
                  const SizedBox(height: 16),

                  // Subject List
                  if (filteredSubjects.isNotEmpty)
                    Expanded(
                      child: ListView.builder(
                        itemCount: filteredSubjects.length,
                        itemBuilder: (context, index) {
                          final subject = filteredSubjects[index];
                          return Card(
                            elevation: 2,
                            margin: const EdgeInsets.symmetric(vertical: 6),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: ListTile(
                              leading: const Icon(
                                Icons.menu_book,
                                color: Colors.deepPurple,
                              ),
                              title: Text(
                                subject["subject_name"],
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              trailing: const Icon(
                                Icons.arrow_forward_ios,
                                size: 18,
                              ),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => PastPaperPage(
                                      subjectName: subject["subject_name"],
                                      subjectId: subject["subject_id"],
                                    ),
                                  ),
                                );
                              },
                            ),
                          );
                        },
                      ),
                    ),

                  // No subjects
                  if (filteredSubjects.isEmpty &&
                      selectedCourseId != null &&
                      selectedYearId != null)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.only(top: 30),
                        child: Text(
                          "No subjects found",
                          style: TextStyle(fontSize: 16, color: Colors.grey),
                        ),
                      ),
                    ),
                ],
              ),
      ),
    );
  }
}
