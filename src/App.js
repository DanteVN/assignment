import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { jsPDF } from 'jspdf';
import './App.css';

const initialCourses = {
    'year1semester1': [
        { id: 'csc101', name: 'Introduction to Programming', credits: 3 },
        { id: 'math101', name: 'Calculus I', credits: 4 }
    ],
    'year1semester2': [
        { id: 'csc102', name: 'Data Structures', credits: 3 },
        { id: 'math102', name: 'Calculus II', credits: 4 }
    ],
};

function App() {
    const [courses, setCourses] = useState(initialCourses);

    const onDragEnd = (result) => {
        console.log('Drag result:', result);  // Debug output
        const { source, destination } = result;
        if (!destination) return; // Dropped outside any droppable area

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const start = courses[source.droppableId];
        const finish = courses[destination.droppableId];

        if (source.droppableId === destination.droppableId) {
            const newCourseItems = Array.from(start);
            const [removed] = newCourseItems.splice(source.index, 1);
            newCourseItems.splice(destination.index, 0, removed);

            const newState = {
                ...courses,
                [source.droppableId]: newCourseItems,
            };

            setCourses(newState);
        } else {
            const startCourseItems = Array.from(start);
            const finishCourseItems = Array.from(finish);
            const [removed] = startCourseItems.splice(source.index, 1);
            finishCourseItems.splice(destination.index, 0, removed);

            const newState = {
                ...courses,
                [source.droppableId]: startCourseItems,
                [destination.droppableId]: finishCourseItems,
            };

            setCourses(newState);
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.text('Your Course Plan', 10, 10);
        let y = 20;
        Object.entries(courses).forEach(([semester, courses]) => {
            doc.text(semester.replace('year', 'Year ').replace('semester', ' Semester '), 10, y);
            y += 10;
            courses.forEach(course => {
                doc.text(`${course.name} (${course.credits} credits)`, 10, y);
                y += 10;
            });
            y += 10;
        });
        doc.save('course-plan.pdf');
    };

    return (
        <div className="App">
            <DragDropContext onDragEnd={onDragEnd}>
                {Object.entries(courses).map(([semesterId, semesterCourses]) => (
                    <Droppable droppableId={semesterId} key={semesterId}>
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className="semester">
                                <h3>{semesterId.replace('year', 'Year ').replace('semester', ' Semester ')}</h3>
                                {semesterCourses.map((course, index) => (
                                    <Draggable key={course.id} draggableId={course.id} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="course">
                                                {course.name} ({course.credits} credits)
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                ))}
            </DragDropContext>
            <button onClick={generatePDF} style={{ marginTop: '20px' }}>Download Plan</button>
        </div>
    );
}

export default App;