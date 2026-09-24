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
    name: 'motion_rig.kaif',
    size: 680,
    type: 'application/x-kaif-script',
    extension: 'kaif',
    isText: true,
    content: `# Khan Mohammed Kaif 3D Rigging Script
rig.target = "Bipedal_Hero_Mesh"
rig.inverse_kinematics = true
rig.fps = 60
rig.bake_keyframes([0, 12, 24, 48, 72])
print("[KAIF 3D] Neural skeleton rig initialized successfully.")`,
    addedAt: new Date(Date.now() - 1000 * 60 * 3),
    status: 'staged'
  },
  {
    id: 'file-3',
    name: 'hero_character.obj',
    size: 4520,
    type: 'model/obj',
    extension: 'obj',
    isText: true,
    content: `# Wavefront OBJ 3D Model
# Architect: Khan Mohammed Kaif
v -0.500000 -0.500000 0.500000
v 0.500000 -0.500000 0.500000
v -0.500000 0.500000 0.500000
v 0.500000 0.500000 0.500000
v -0.500000 0.500000 -0.500000
v 0.500000 0.500000 -0.500000
v -0.500000 -0.500000 -0.500000
v 0.500000 -0.500000 -0.500000
vn 0.0000 0.0000 1.0000
vn 0.0000 1.0000 0.0000
vn 0.0000 0.0000 -1.0000
vn 0.0000 -1.0000 0.0000
vn 1.0000 0.0000 0.0000
vn -1.0000 0.0000 0.0000
f 1//1 2//1 4//1 3//1
f 3//2 4//2 6//2 5//2
f 5//3 6//3 8//3 7//3
f 7//4 8//4 2//4 1//4
f 2//5 8//5 6//5 4//5
f 7//6 1//6 3//6 5//6`,
    binaryBlob: new Blob([
      `# Wavefront OBJ 3D Model
# Architect: Khan Mohammed Kaif
v -0.500000 -0.500000 0.500000
v 0.500000 -0.500000 0.500000
v -0.500000 0.500000 0.500000
v 0.500000 0.500000 0.500000
v -0.500000 0.500000 -0.500000
v 0.500000 0.500000 -0.500000
v -0.500000 -0.500000 -0.500000
v 0.500000 -0.500000 -0.500000
vn 0.0000 0.0000 1.0000
vn 0.0000 1.0000 0.0000
vn 0.0000 0.0000 -1.0000
vn 0.0000 -1.0000 0.0000
vn 1.0000 0.0000 0.0000
vn -1.0000 0.0000 0.0000
f 1//1 2//1 4//1 3//1
f 3//2 4//2 6//2 5//2
f 5//3 6//3 8//3 7//3
f 7//4 8//4 2//4 1//4
f 2//5 8//5 6//5 4//5
f 7//6 1//6 3//6 5//6`
    ], { type: 'model/obj' }),
    addedAt: new Date(Date.now() - 1000 * 60 * 2),
    status: 'staged'
  }
];

export const SAMPLE_3D_ANIMATION_FILES: QueuedFile[] = [
  {
    id: 'file-3d-1',
    name: 'cyber_avatar.obj',
    size: 2150,
    type: 'model/obj',
    extension: 'obj',
    isText: false,
    binaryBlob: new Blob([
      `# 3D Avatar Mesh (OBJ Format)
# Architect: Khan Mohammed Kaif 3D Animation Suite
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 1.0 1.0 0.0
v 0.0 1.0 0.0
f 1 2 3 4`
    ], { type: 'model/obj' }),
    addedAt: new Date(),
    status: 'staged'
  },
  {
    id: 'file-3d-2',
    name: 'armature_kinematics.blend',
    size: 8940,
    type: 'application/x-blender',
    extension: 'blend',
    isText: false,
    binaryBlob: new Blob([
      new Uint8Array([66, 76, 69, 78, 68, 69, 82, 45, 118, 51, 48, 48]) // BLENDER-v300 magic header
    ], { type: 'application/x-blender' }),
    addedAt: new Date(),
    status: 'staged'
  },
  {
    id: 'file-3d-3',
    name: 'animation_rig.kaif',
    size: 512,
    type: 'application/x-kaif-script',
    extension: 'kaif',
    isText: true,
    content: `# [KMK-3D] Rigging Script
scene.active_rig = "Armature_Primary"
ik_solver.tolerance = 0.001
export_options.include_manifest = true`,
    addedAt: new Date(),
    status: 'staged'
  }
];
