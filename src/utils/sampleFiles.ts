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
  },
  {
    id: 'file-4',
    name: 'KinematicRig_WalkCycle.kaif',
    size: 1240,
    type: 'text/x-kaif-script',
    extension: 'kaif',
    isText: true,
    content: `# [KMKaif Studio Animation Script]
ANIMATION_CLIP: WalkCycle_60fps
FPS: 60
ROOT_BONE: Hips_Master
KEYFRAMES:
  frame_0:   { pos: [0.0, 0.95, 0.0], rot: [0.0, 0.0, 0.0] }
  frame_15:  { pos: [0.0, 0.98, 0.12], rot: [2.5, 0.0, -1.2] }
  frame_30:  { pos: [0.0, 0.94, 0.25], rot: [0.0, 0.0, 0.0] }
  frame_45:  { pos: [0.0, 0.98, 0.38], rot: [-2.5, 0.0, 1.2] }
  frame_60:  { pos: [0.0, 0.95, 0.50], rot: [0.0, 0.0, 0.0] }
INTERPOLATION: HermiteCubicSpline
LOOP_BEHAVIOR: RepeatSeamless`,
    addedAt: new Date(Date.now() - 1000 * 45),
    status: 'staged'
  },
  {
    id: 'file-5',
    name: 'CharacterGeometry_Hero.obj',
    size: 2480,
    type: 'model/obj',
    extension: 'obj',
    isText: true,
    content: `# Wavefront 3D OBJ - Exported from Khan Kaif 3D Suite
# Geometric Vertices
v 0.000000 1.000000 0.000000
v -1.000000 -1.000000 1.000000
v 1.000000 -1.000000 1.000000
v 1.000000 -1.000000 -1.000000
v -1.000000 -1.000000 -1.000000
# Vertex Normals
vn 0.000000 1.000000 0.000000
vn 0.000000 0.000000 1.000000
vn 1.000000 0.000000 0.000000
vn 0.000000 0.000000 -1.000000
vn -1.000000 0.000000 0.000000
# Polygonal Faces
f 1//1 2//2 3//2
f 1//1 3//3 4//3
f 1//1 4//4 5//4
f 1//1 5//5 2//5
f 2//2 5//5 4//4
f 4//4 3//3 2//2`,
    addedAt: new Date(Date.now() - 1000 * 20),
    status: 'staged'
  }
];
