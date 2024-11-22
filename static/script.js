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

        // Handle share button click
        if (e.target.classList.contains('btn-share')) {
            e.stopPropagation(); // Prevent card expansion when clicking share
            const title = lyricCard.querySelector('h3').textContent;
            const content = lyricCard.querySelector('.lyrics-content p').textContent;
            
            const shareData = {
                title: 'Shared Lyric: ' + title,
                text: `${title}\n\n${content}\n\nShared via Lyrics Library`,
            };

            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                } else {
                    // Fallback for browsers that don't support Web Share API
                    const textArea = document.createElement('textarea');
                    textArea.value = shareData.text;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert('Lyrics copied to clipboard!');
                }
            } catch (err) {
                console.error('Error sharing:', err);
                alert('Could not share the lyrics. They have been copied to your clipboard instead.');
            }
            return;
        }

        // Toggle card expansion
        const isButton = e.target.tagName === 'BUTTON';
        if (!isButton) {
            lyricCard.classList.toggle('expanded');
        }
    });

    // Dropdown menu functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const userMenu = document.querySelector('.user-menu');
    let backdrop = document.querySelector('.backdrop');

    // Create backdrop if it doesn't exist
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'backdrop';
        document.body.appendChild(backdrop);
    }

    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        userMenu.classList.toggle('active');
        backdrop.classList.toggle('active');
    });

    // Close dropdown when clicking outside or on backdrop
    backdrop.addEventListener('click', function() {
        userMenu.classList.remove('active');
        backdrop.classList.remove('active');
    });

    document.addEventListener('click', function(e) {
        if (!userMenu.contains(e.target)) {
            userMenu.classList.remove('active');
            backdrop.classList.remove('active');
        }
    });

    // Close dropdown when clicking a menu item
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            userMenu.classList.remove('active');
            backdrop.classList.remove('active');
        });
    });
});
