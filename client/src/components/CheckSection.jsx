import { useState, useEffect } from "react";

export default function CheckSection() {

    useEffect(() => {
        const [currentSection, setCurrentSection] = useState([]);
        
        async function getCurrentSection() {
            const response = await fetch(`http://localhost:5050/record/sections/${req.params.id}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                return;
            }
            const sectionData = await response.json();
            setCurrentSection(sectionData);
        }
        getCurrentSection();
        return;
    }, []);

    return (
        <h1>{sectionData.section}</h1>
    );
}