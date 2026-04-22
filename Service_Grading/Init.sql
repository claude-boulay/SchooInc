-- Support tables pour joindre avec les grades
CREATE TABLE class_enrollments (
    class_id UUID NOT NULL,
    student_id UUID NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (class_id, student_id)
);

CREATE TABLE class_courses (
    class_id UUID NOT NULL,
    course_id UUID NOT NULL,
    PRIMARY KEY (class_id, course_id)
);

CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value DECIMAL(4, 2) NOT NULL CHECK (value >= 0 AND value <= 20), -- Note sur 20
    student_id UUID NOT NULL, -- Référence externe
    course_id UUID NOT NULL,  -- Référence externe
    event_id UUID, -- Référence externe vers un évènement du service School
    professor_id UUID NOT NULL, -- Qui a mis la note
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les calculs statistiques (médiane, etc.) par cours
CREATE INDEX idx_grades_course ON grades(course_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_event ON grades(event_id);
CREATE UNIQUE INDEX idx_grades_event_student_unique ON grades(event_id, student_id) WHERE event_id IS NOT NULL;
CREATE INDEX idx_class_enrollments_class ON class_enrollments(class_id);
CREATE INDEX idx_class_enrollments_student ON class_enrollments(student_id);
CREATE INDEX idx_class_courses_class ON class_courses(class_id);
CREATE INDEX idx_class_courses_course ON class_courses(course_id);
