import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = "http://192.168.18.47:3000";

  // Fetch academic list
  static Future<List<dynamic>> fetchAcademics() async {
    final response = await http.get(Uri.parse("$baseUrl/api/academic"));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load academics');
    }
  }

  // Fetch courses by academicId
  static Future<List<dynamic>> fetchCourses(int academicId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/course/byAcademic/$academicId'),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load courses');
    }
  }

  // Fetch years by courseId
  static Future<List<dynamic>> fetchYears(int courseId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/year/byCourse/$courseId'),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load years');
    }
  }

  // Fetch subjects by yearId
  static Future<List<dynamic>> fetchSubjects(int yearId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/subject/byYear/$yearId'),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load subjects');
    }
  }

  // Fetch past papers by subjectId
  static Future<List<dynamic>> fetchPastPapers(int subjectId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/pastpaper/bySubject/$subjectId'),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);

      // Fix file path if needed
      for (var paper in data) {
        final path = paper['file_path'];
        if (path != null && !path.toString().startsWith("http")) {
          paper['file_path'] = "$baseUrl/$path";
        }
      }

      return data;
    } else {
      throw Exception('Failed to load past papers');
    }
  }

  // Upload a new paper
  static Future<bool> uploadPaper({
    required int academicId,
    required int courseId,
    required int yearId,
    required int subjectId,
    required String examYear,
    required File file,
  }) async {
    try {
      var uri = Uri.parse("$baseUrl/api/paper/upload");

      var request = http.MultipartRequest('POST', uri)
        ..fields['academicId'] = academicId.toString()
        ..fields['courseId'] = courseId.toString()
        ..fields['yearId'] = yearId.toString()
        ..fields['subjectId'] = subjectId.toString()
        ..fields['examYear'] = examYear
        ..files.add(await http.MultipartFile.fromPath('file', file.path));

      var response = await request.send();

      if (response.statusCode == 200) {
        print(" Paper uploaded successfully");
        return true;
      } else {
        final respStr = await response.stream.bytesToString();
        print("Upload failed (${response.statusCode}): $respStr");
        return false;
      }
    } catch (e) {
      print("Exception during upload: $e");
      return false;
    }
  }
}
