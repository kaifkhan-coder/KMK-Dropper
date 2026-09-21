import { QueuedFile } from '../types';

export const INITIAL_SAMPLE_FILES: QueuedFile[] = [
  {
    id: 'file-1',
    name: 'StudentRegistry.java',
    size: 1420,
    type: 'text/x-java-source',
    extension: 'java',
    isText: true,
    content: `package com.university.cs101;

import java.util.ArrayList;
import java.util.List;

/**
 * Lab Assignment #4: Student Record Management System
 */
public class StudentRegistry {
    private final List<String> enrolledStudents = new ArrayList<>();

    public void register(String studentId, String fullName) {
        enrolledStudents.add(studentId + " - " + fullName);
        System.out.println("Registered: " + fullName);
    }

    public int getEnrollmentCount() {
        return enrolledStudents.size();
    }
}`,
    addedAt: new Date(Date.now() - 1000 * 60 * 5),
    status: 'staged'
  },
  {
    id: 'file-2',
    name: 'LabNotes_BinaryTrees.txt',
    size: 890,
    type: 'text/plain',
    extension: 'txt',
    isText: true,
    content: `CS204 Data Structures & Algorithms
Topic: Self-Balancing Binary Search Trees (AVL & Red-Black)

Key Properties:
1. Balance Factor = height(left) - height(right) must be in {-1, 0, 1}.
2. Rotations required for insertion: Left-Left, Right-Right, Left-Right, Right-Left.
3. Lookup time complexity guaranteed O(log N).

Submission Deadline: Friday 23:59 via QR Package Receiver.`,
    addedAt: new Date(Date.now() - 1000 * 60 * 3),
    status: 'staged'
  },
  {
    id: 'file-3',
    name: 'GradeAnalysis.py',
    size: 1180,
    type: 'text/x-python',
    extension: 'py',
    isText: true,
    content: `import statistics

def compute_grade_metrics(scores):
    mean_val = statistics.mean(scores)
    median_val = statistics.median(scores)
    std_dev = statistics.stdev(scores) if len(scores) > 1 else 0.0
    return {
        "mean": round(mean_val, 2),
        "median": round(median_val, 2),
        "std_dev": round(std_dev, 2)
    }

if __name__ == "__main__":
    sample_scores = [88.5, 92.0, 79.5, 95.0, 84.0, 91.5]
    print("Grade Analysis Summary:", compute_grade_metrics(sample_scores))`,
    addedAt: new Date(Date.now() - 1000 * 60 * 1),
    status: 'staged'
  }
];
