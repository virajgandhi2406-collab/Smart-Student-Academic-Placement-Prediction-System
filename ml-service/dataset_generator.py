"""
EduPredict Synthetic Historical Placement Dataset Generator
Generates realistic university student placement historical observations
for model training and benchmarking.
"""

import csv
import random
import os

def generate_dataset(num_samples=1200, output_file='placement_dataset.csv'):
    fieldnames = [
        'student_id',
        'cgpa',
        'tenth_percent',
        'twelfth_percent',
        'attendance_percent',
        'active_backlogs',
        'coding_score',
        'aptitude_score',
        'skills_count',
        'projects_count',
        'internships_count',
        'certifications_count',
        'faculty_score',
        'placed'
    ]

    records = []
    for i in range(1, num_samples + 1):
        cgpa = round(random.gauss(7.4, 1.1), 2)
        cgpa = max(5.0, min(9.9, cgpa))

        tenth = round(random.gauss(80.0, 8.0), 1)
        tenth = max(55.0, min(98.0, tenth))

        twelfth = round(random.gauss(78.0, 9.0), 1)
        twelfth = max(50.0, min(98.0, twelfth))

        attendance = round(random.gauss(82.0, 10.0), 1)
        attendance = max(50.0, min(100.0, attendance))

        backlogs = 0 if random.random() > 0.18 else random.choice([1, 2, 3])

        # Coding test performance (0 - 100)
        coding_base = (cgpa / 10.0) * 80 + random.gauss(5, 12)
        coding_score = round(max(10.0, min(100.0, coding_base)), 1)

        # Aptitude test performance (0 - 100)
        aptitude_base = (twelfth / 100.0) * 85 + random.gauss(0, 10)
        aptitude_score = round(max(15.0, min(100.0, aptitude_base)), 1)

        skills_count = random.choices([2, 3, 4, 5, 6, 7, 8, 10], weights=[5, 15, 25, 25, 15, 8, 5, 2])[0]
        projects_count = random.choices([0, 1, 2, 3, 4], weights=[10, 30, 35, 15, 10])[0]
        internships_count = random.choices([0, 1, 2], weights=[50, 40, 10])[0]
        certifications_count = random.choices([0, 1, 2, 3], weights=[25, 45, 20, 10])[0]

        faculty_base = (cgpa * 8) + (coding_score * 0.2) + random.gauss(0, 5)
        faculty_score = round(max(30.0, min(100.0, faculty_base)), 1)

        # Placement ground truth probability function
        log_odds = (
            (cgpa - 7.0) * 1.5 +
            (coding_score - 60.0) * 0.05 +
            (aptitude_score - 60.0) * 0.04 +
            (projects_count * 0.4) +
            (internships_count * 0.9) +
            (skills_count * 0.15) -
            (backlogs * 1.8) -
            (1.5 if attendance < 75 else 0)
        )

        prob = 1.0 / (1.0 + pow(2.718281828, -log_odds))
        placed = 1 if prob >= 0.50 else 0

        records.append({
            'student_id': f'STU_{1000 + i}',
            'cgpa': cgpa,
            'tenth_percent': tenth,
            'twelfth_percent': twelfth,
            'attendance_percent': attendance,
            'active_backlogs': backlogs,
            'coding_score': coding_score,
            'aptitude_score': aptitude_score,
            'skills_count': skills_count,
            'projects_count': projects_count,
            'internships_count': internships_count,
            'certifications_count': certifications_count,
            'faculty_score': faculty_score,
            'placed': placed
        })

    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, output_file)

    with open(file_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    print(f'[DATASET] Generated {num_samples} historical student placement records at: {file_path}')
    return file_path

if __name__ == '__main__':
    generate_dataset()
