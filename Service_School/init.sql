CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    professor_id UUID NOT NULL, -- ID du prof principale
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE class_enrollments (
    class_id UUID REFERENCES classes(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL, -- ID de l'étudiant qui appratient à une classe
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (class_id, student_id)
);

CREATE TABLE class_courses (
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    PRIMARY KEY (class_id, course_id)
);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    professor_id UUID NOT NULL, -- ID du prof qui enseigne le cours
);