import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'services/api_service.dart';
import 'dart:io';
import 'package:file_picker/file_picker.dart';

class AddPaperPage extends StatefulWidget {
  const AddPaperPage({super.key});

  @override
  State<AddPaperPage> createState() => _AddPaperPageState();
}

class _AddPaperPageState extends State<AddPaperPage> {
  int? selectedAcademic;
  int? selectedCourse;
  int? selectedYear;
  int? selectedSubject;

  List<dynamic> academics = [];
  List<dynamic> courses = [];
  List<dynamic> years = [];
  List<dynamic> subjects = [];

  final TextEditingController examYearController = TextEditingController();
  File? selectedFile;

  @override
  void initState() {
    super.initState();
    loadAcademics();
  }

  Future<void> loadAcademics() async {
    try {
      final data = await ApiService.fetchAcademics();
      setState(() => academics = data);
    } catch (e) {
      print("Error loading academics: $e");
    }
  }

  Future<void> loadCourses() async {
    if (selectedAcademic == null) return;
    try {
      final data = await ApiService.fetchCourses(selectedAcademic!);
      setState(() => courses = data);
    } catch (e) {
      print("Error loading courses: $e");
    }
  }

  Future<void> loadYears() async {
    if (selectedCourse == null) return;
    try {
      final data = await ApiService.fetchYears(selectedCourse!);
      setState(() => years = data);
    } catch (e) {
      print("Error loading years: $e");
    }
  }

  Future<void> loadSubjects() async {
    if (selectedYear == null) return;
    try {
      final data = await ApiService.fetchSubjects(selectedYear!);
      print("Subjects fetched: $data");
      setState(() => subjects = data);
    } catch (e) {
      print("Error loading subjects: $e");
    }
  }

  Future<void> pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );
    if (result != null && result.files.single.path != null) {
      setState(() => selectedFile = File(result.files.single.path!));
    }
  }

  Future<void> uploadPaper() async {
    if (selectedAcademic == null ||
        selectedCourse == null ||
        selectedYear == null ||
        selectedSubject == null ||
        examYearController.text.isEmpty ||
        selectedFile == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Please fill all fields")));
      return;
    }

    final success = await ApiService.uploadPaper(
      academicId: selectedAcademic!,
      courseId: selectedCourse!,
      yearId: selectedYear!,
      subjectId: selectedSubject!,
      examYear: examYearController.text,
      file: selectedFile!,
    );

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Color.fromARGB(255, 68, 183, 58),
          content: Text("Paper uploaded successfully!"),
        ),
      );
      setState(() {
        examYearController.clear();
        selectedFile = null;
      });
    } else {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Upload failed")));
    }
  }

  @override
  Widget build(BuildContext context) {
    const purple = Colors.deepPurple;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 25),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title as Heading
              Center(
                child: Text(
                  "Add Paper",
                  style: GoogleFonts.poppins(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: purple,
                  ),
                ),
              ),
              const SizedBox(height: 25),

              // Form Card
              Card(
                color: Colors.white,
                elevation: 3,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 25,
                  ),
                  child: Column(
                    children: [
                      buildDropdown(
                        label: "Select Academic",
                        value: selectedAcademic,
                        items: academics,
                        getLabel: (item) => item['academic_name'] ?? 'Unknown',
                        getValue: (item) => item['academic_id'],
                        onChanged: (value) {
                          setState(() {
                            selectedAcademic = value;
                            selectedCourse = null;
                            selectedYear = null;
                            selectedSubject = null;
                            courses.clear();
                            years.clear();
                            subjects.clear();
                          });
                          loadCourses();
                        },
                        purple: purple,
                      ),
                      buildDropdown(
                        label: "Select Course",
                        value: selectedCourse,
                        items: courses,
                        getLabel: (item) => item['course_name'] ?? 'Unknown',
                        getValue: (item) => item['course_id'],
                        onChanged: (value) {
                          setState(() {
                            selectedCourse = value;
                            selectedYear = null;
                            selectedSubject = null;
                            years.clear();
                            subjects.clear();
                          });
                          loadYears();
                        },
                        purple: purple,
                      ),
                      buildDropdown(
                        label: "Select Year",
                        value: selectedYear,
                        items: years,
                        getLabel: (item) => item['year_name'] ?? 'Unknown',
                        getValue: (item) => item['year_id'],
                        onChanged: (value) {
                          setState(() {
                            selectedYear = value;
                            selectedSubject = null;
                            subjects.clear();
                          });
                          loadSubjects();
                        },
                        purple: purple,
                      ),
                      buildDropdown(
                        label: "Select Subject",
                        value: selectedSubject,
                        items: subjects,
                        getLabel: (item) => item['subject_name'] ?? 'Unknown',
                        getValue: (item) => item['subject_id'],
                        onChanged: (value) {
                          setState(() {
                            selectedSubject = value;
                          });
                        },
                        purple: purple,
                      ),
                      const SizedBox(height: 20),
                      TextField(
                        controller: examYearController,
                        decoration: InputDecoration(
                          labelText: "Exam Year",
                          focusedBorder: OutlineInputBorder(
                            borderSide: const BorderSide(
                              color: purple,
                              width: 2,
                            ),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        keyboardType: TextInputType.number,
                      ),
                      const SizedBox(height: 20),
                      OutlinedButton.icon(
                        onPressed: pickFile,
                        icon: const Icon(Icons.upload_file),
                        label: Text(
                          selectedFile == null
                              ? "Choose PDF File"
                              : selectedFile!.path.split('/').last,
                          overflow: TextOverflow.ellipsis,
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: purple, width: 1.5),
                          foregroundColor: purple,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 14,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          backgroundColor: Colors.grey.shade50,
                        ),
                      ),
                      const SizedBox(height: 30),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: uploadPaper,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: purple,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                            elevation: 3,
                          ),
                          child: const Text(
                            "Upload Paper",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget buildDropdown({
    required String label,
    required int? value,
    required List<dynamic> items,
    required Function(dynamic) getLabel,
    required Function(dynamic) getValue,
    required Function(dynamic) onChanged,
    required Color purple,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: DropdownButtonFormField<int>(
        initialValue: value,
        isExpanded: true,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: purple, width: 2),
          ),
        ),
        items: items.map<DropdownMenuItem<int>>((item) {
          return DropdownMenuItem<int>(
            value: getValue(item),
            child: Text(getLabel(item), overflow: TextOverflow.ellipsis),
          );
        }).toList(),
        onChanged: (val) => onChanged(val),
      ),
    );
  }
}
