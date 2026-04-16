import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'PDFViewer_Page.dart';
import 'services/api_service.dart';

class PastPaperPage extends StatefulWidget {
  final String subjectName;
  final int subjectId;

  const PastPaperPage({
    super.key,
    required this.subjectName,
    required this.subjectId,
  });

  @override
  PastPaperPageState createState() => PastPaperPageState();
}

class PastPaperPageState extends State<PastPaperPage> {
  List<dynamic> pastPapers = [];
  List<dynamic> filteredPapers = [];
  bool isLoading = true;
  String? errorMessage;
  String query = "";

  //download progress
  Map<String, double> downloadProgress = {};

  @override
  void initState() {
    super.initState();
    fetchPastPapers();
  }

  Future<void> fetchPastPapers() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final data = await ApiService.fetchPastPapers(widget.subjectId);
      setState(() {
        pastPapers = data;
        filteredPapers = data;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = "Failed to fetch past papers.";
      });
      debugPrint("Error fetching past papers: $e");
    }
  }

  void filterPapers(String value) {
    setState(() {
      query = value;
      filteredPapers = pastPapers
          .where(
            (paper) => paper['exam_year'].toString().toLowerCase().contains(
              query.toLowerCase(),
            ),
          )
          .toList();
    });
  }

  //open file
  Future<void> openFile(String url) async {
    try {
      final tempDir = await getTemporaryDirectory();
      final fileName = url.split('/').last;
      final filePath = "${tempDir.path}/$fileName";
      final file = File(filePath);

      if (!(await file.exists()) || await file.length() == 0) {
        final dio = Dio();
        await dio.download(url, filePath);
      }

      if (await file.exists()) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => PdfViewerPage(path: filePath),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Unable to open file"),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      debugPrint("Error opening file: $e");
    }
  }

  //download file
  Future<void> downloadFile(String url, BuildContext context) async {
    final dio = Dio();
    final fileName = url.split('/').last;

    Directory directory;

    if (Platform.isAndroid) {
      if (!await Permission.storage.isGranted) {
        await Permission.storage.request();
      }
      if (!await Permission.storage.isGranted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Storage permission denied"),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      // Download subfolder
      directory =
          await getExternalStorageDirectory() ??
          Directory('/storage/emulated/0/Download');
      final downloadDir = Directory('${directory.path}/Download');
      if (!downloadDir.existsSync()) downloadDir.createSync(recursive: true);
      directory = downloadDir;
    } else if (Platform.isIOS) {
      directory = await getApplicationDocumentsDirectory();
    } else {
      throw "Unsupported platform";
    }

    final filePath = "${directory.path}/$fileName";

    setState(() {
      downloadProgress[fileName] = 0;
    });

    try {
      await dio.download(
        url,
        filePath,
        onReceiveProgress: (received, total) {
          if (total != -1) {
            setState(() {
              downloadProgress[fileName] = received / total;
            });
          }
        },
      );

      setState(() {
        downloadProgress.remove(fileName);
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            "$fileName downloaded successfully!\nPath: ${directory.path}",
          ),
          backgroundColor: Colors.green,
          duration: const Duration(seconds: 3),
        ),
      );
    } catch (e) {
      debugPrint("Error downloading file: $e");
      setState(() {
        downloadProgress.remove(fileName);
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Failed to download file"),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.deepPurple),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: Text(
          "Available Past Papers",
          style: GoogleFonts.robotoSlab(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF4C24C7),
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Padding(
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
                    const SizedBox(height: 16),
                    if (pastPapers.isNotEmpty)
                      TextField(
                        onChanged: filterPapers,
                        decoration: InputDecoration(
                          hintText: "Search...",
                          filled: true,
                          fillColor: Colors.grey.shade100,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 14,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(30),
                            borderSide: BorderSide.none,
                          ),
                          suffixIcon: Icon(
                            Icons.search,
                            color: Colors.deepPurple.shade700,
                          ),
                        ),
                      ),
                    const SizedBox(height: 16),
                    Expanded(
                      child: filteredPapers.isNotEmpty
                          ? ListView.builder(
                              itemCount: filteredPapers.length,
                              itemBuilder: (context, index) {
                                final paper = filteredPapers[index];
                                final fileName = paper['file_path']
                                    .split('/')
                                    .last;
                                final progress =
                                    downloadProgress[fileName] ?? 0.0;

                                return Card(
                                  elevation: 3,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                  margin: const EdgeInsets.symmetric(
                                    vertical: 8,
                                  ),
                                  child: ListTile(
                                    leading: const Icon(
                                      Icons.picture_as_pdf,
                                      color: Colors.deepPurple,
                                      size: 32,
                                    ),
                                    title: Text(
                                      "Exam Year: ${paper['exam_year']}",
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                    trailing: progress > 0
                                        ? SizedBox(
                                            width: 24,
                                            height: 24,
                                            child: CircularProgressIndicator(
                                              value: progress,
                                              strokeWidth: 2.5,
                                            ),
                                          )
                                        : IconButton(
                                            icon: const Icon(
                                              Icons.download,
                                              color: Colors.deepPurple,
                                            ),
                                            onPressed: () => downloadFile(
                                              paper['file_path'],
                                              context,
                                            ),
                                            splashColor: Colors.transparent,
                                            highlightColor: Colors.transparent,
                                            tooltip: "Download PDF",
                                          ),
                                    onTap: () => openFile(paper['file_path']),
                                  ),
                                );
                              },
                            )
                          : const Center(
                              child: Text(
                                "No past papers found",
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey,
                                ),
                              ),
                            ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
