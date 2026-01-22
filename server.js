const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk static files
app.use(express.static(path.join(__dirname, 'public')));

// Route utama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API untuk konten anniversary
app.get('/api/anniversary-data', (req, res) => {
    const anniversaryData = {
        title: "Happy Anniversary!",
        subtitle: "Celebrating 2 Years of Love and Memories",
        sections: [
            {
                id: "intro",
                title: "Second Year Recap",
                content: "Looking back at our second year together, we've grown stronger as a couple and explored more delicious foods. This year has been filled with deeper understanding, love, and unforgettable moments.",
                year: "",
                image: "images/beginning.jpg"
            },
            {
                id: "memories-gallery",
                title: "Our Second Year Journey",
                subtitle: "Every month, every moment captured",
                content: "",
                year: "", 
                type: "gallery",
                photos: [
                    { month: "February 2025", image: "images/journey-photos/february.jpg" },
                    { month: "March 2025", image: "images/journey-photos/march.jpeg" },
                    { month: "April 2025", image: "images/journey-photos/april.jpeg" },
                    { month: "May 2025", image: "images/journey-photos/may.jpeg" },
                    { month: "June 2025", image: "images/journey-photos/june.jpeg" },
                    { month: "July 2025", image: "images/journey-photos/july.jpg" },
                    { month: "August 2025", image: "images/journey-photos/august.jpeg" },
                    { month: "September 2025", image: "images/journey-photos/september.jpg" },
                    { month: "October 2025", image: "images/journey-photos/october.jpeg" },
                    { month: "November 2025", image: "images/journey-photos/november.jpg" },
                    { month: "December 2025", image: "images/journey-photos/december.jpg" },
                    { month: "January 2026", image: "images/journey-photos/january.jpg" }
                ]
            },
            {
                id: "puzzle",
                title: "Complete Our Memory",
                content: "Drag and drop the pieces to complete this photo.",
                year: "",
                image: "images/puzzle-photo.jpeg",
                type: "puzzle"
            },
            {
                id: "memory-cards",
                title: "Memory Lane Matching",
                content: "Tap two cards to find the matching pairs!<br>These are our random photos.",
                year: "",
                type: "cards",
                cardPhotos: [
                    "images/card-photos/card1.jpeg",
                    "images/card-photos/card2.jpeg",
                    "images/card-photos/card3.jpeg",
                    "images/card-photos/card4.jpeg",
                    "images/card-photos/card5.jpeg",
                    "images/card-photos/card6.jpeg",
                    "images/card-photos/card7.jpeg",
                    "images/card-photos/card8.jpeg"
                ]
            },
            {
                id: "anniversary-video",
                title: "Our Journey Together",
                content: "A video compilation of our second year together.",
                year: "",
                type: "video",
                videoSrc: "videos/compilation.mp4"
            }
        ]
    };
    
    res.json(anniversaryData);
});

app.listen(PORT, () => {
    console.log(`Anniversary Scrollytelling server is running on http://localhost:${PORT}`);
});