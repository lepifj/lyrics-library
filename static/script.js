document.addEventListener('DOMContentLoaded', () => {
    // Hide loader when page is loaded
    const pageLoader = document.querySelector('.page-loader');
    setTimeout(() => {
        pageLoader.classList.add('hidden');
    }, 500);

    const newLyricBtn = document.getElementById('newLyricBtn');
    const lyricForm = document.getElementById('lyricForm');
    const lyricEntryForm = document.getElementById('lyricEntryForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const formTitle = document.getElementById('formTitle');
    const lyricIdInput = document.getElementById('lyricId');
    const lyricTitleInput = document.getElementById('lyricTitle');
    const lyricContentInput = document.getElementById('lyricContent');
    const lyricsContainer = document.getElementById('lyricsContainer');

    // Show new lyric form
    newLyricBtn.addEventListener('click', () => {
        formTitle.textContent = 'New Lyric';
        lyricIdInput.value = '';
        lyricTitleInput.value = '';
        lyricContentInput.value = '';
        lyricForm.classList.remove('hidden');
    });

    // Hide form
    cancelBtn.addEventListener('click', () => {
        lyricForm.classList.add('hidden');
    });

    // Handle form submission
    lyricEntryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const isEditing = lyricIdInput.value !== '';
        
        const data = {
            title: lyricTitleInput.value,
            content: lyricContentInput.value
        };

        try {
            let response;
            if (isEditing) {
                response = await fetch(`/update_lyric/${lyricIdInput.value}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            } else {
                response = await fetch('/add_lyric', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            }

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while saving the lyric.');
        }
    });

    // Handle card clicks for expansion
    lyricsContainer.addEventListener('click', async (e) => {
        const lyricCard = e.target.closest('.lyric-card');
        if (!lyricCard) return;

        // Handle edit button click
        if (e.target.classList.contains('btn-edit')) {
            e.stopPropagation(); // Prevent card expansion when clicking edit
            const title = lyricCard.querySelector('h3').firstChild.textContent.trim();
            const content = lyricCard.querySelector('p').textContent;
            const id = lyricCard.dataset.id;

            formTitle.textContent = 'Edit Lyric';
            lyricIdInput.value = id;
            lyricTitleInput.value = title;
            lyricContentInput.value = content;
            lyricForm.classList.remove('hidden');
            return;
        }

        // Handle delete button click
        if (e.target.classList.contains('btn-delete')) {
            e.stopPropagation(); // Prevent card expansion when clicking delete
            if (confirm('Are you sure you want to delete this lyric?')) {
                try {
                    const response = await fetch(`/delete_lyric/${lyricCard.dataset.id}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        lyricCard.remove();
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('An error occurred while deleting the lyric.');
                }
            }
            return;
        }

        // Toggle card expansion
        const isButton = e.target.tagName === 'BUTTON';
        if (!isButton) {
            lyricCard.classList.toggle('expanded');
        }
    });
});