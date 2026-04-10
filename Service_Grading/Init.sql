CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value DECIMAL(4, 2) NOT NULL CHECK (value >= 0 AND value <= 20), -- Note sur 20
    student_id UUID NOT NULL, -- Référence externe
    course_id UUID NOT NULL,  -- Référence externe
    professor_id UUID NOT NULL, -- Qui a mis la note
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les calculs statistiques (médiane, etc.) par cours
CREATE INDEX idx_grades_course ON grades(course_id);
CREATE INDEX idx_grades_student ON grades(student_id);