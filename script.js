document.addEventListener('DOMContentLoaded', () => {
    // DOM elementlerini seçme
    const noteForm = document.querySelector('.note-form');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const saveButton = document.getElementById('save-btn');
    const cancelButton = document.getElementById('cancel-btn');
    const notesList = document.getElementById('notes-list');
    
    // Not ekleme/düzenleme durumunu takip etmek için değişkenler
    let isEditing = false;
    let currentNoteId = null;
    
    // LocalStorage'dan notları yükleme
    loadNotes();
    
    // Yeni not ekleme veya mevcut notu güncelleme
    saveButton.addEventListener('click', () => {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        
        if (!title || !content) {
            alert('Lütfen başlık ve içerik girişi yapınız!');
            return;
        }
        
        if (isEditing && currentNoteId) {
            // Mevcut notu güncelleme
            updateNote(currentNoteId, title, content);
        } else {
            // Yeni not ekleme
            addNote(title, content);
        }
        
        // Formu temizle
        resetForm();
    });
    
    // İptal butonu işlevi
    cancelButton.addEventListener('click', resetForm);
    
    // Not ekleme fonksiyonu
    function addNote(title, content) {
        const notes = getNotes();
        
        // Yeni not objesi oluşturma
        const newNote = {
            id: Date.now().toString(), // Benzersiz ID
            title: title,
            content: content,
            date: new Date().toLocaleString('tr-TR')
        };
        
        // Not dizisine ekleme ve localStorage'a kaydetme
        notes.push(newNote);
        saveNotes(notes);
        
        // UI'ı güncelleme
        displayNotes();
    }
    
    // Notu güncelleme fonksiyonu
    function updateNote(id, title, content) {
        const notes = getNotes();
        
        // Notu bulma ve güncelleme
        const updatedNotes = notes.map(note => {
            if (note.id === id) {
                return {
                    ...note,
                    title: title,
                    content: content,
                    date: new Date().toLocaleString('tr-TR') + ' (düzenlendi)'
                };
            }
            return note;
        });
        
        // Güncellenmiş notları kaydetme
        saveNotes(updatedNotes);
        
        // UI'ı güncelleme
        displayNotes();
    }
    
    // Notu silme fonksiyonu
    function deleteNote(id) {
        if (!confirm('Bu notu silmek istediğinize emin misiniz?')) {
            return;
        }
        
        const notes = getNotes();
        
        // ID'ye göre notu filtreleme (silme)
        const filteredNotes = notes.filter(note => note.id !== id);
        
        // Güncellenmiş notları kaydetme
        saveNotes(filteredNotes);
        
        // UI'ı güncelleme
        displayNotes();
    }
    
    // Notu düzenleme formunu hazırlama
    function editNote(id) {
        const notes = getNotes();
        const noteToEdit = notes.find(note => note.id === id);
        
        if (noteToEdit) {
            noteTitleInput.value = noteToEdit.title;
            noteContentInput.value = noteToEdit.content;
            
            // Düzenleme modunu aktifleştirme
            isEditing = true;
            currentNoteId = id;
            
            // Buton görünümlerini ayarlama
            saveButton.innerHTML = '<i class="fas fa-save"></i> Güncelle';
            cancelButton.style.display = 'inline-flex';
            
            // Forma odaklanma
            noteTitleInput.focus();
        }
    }
    
    // Form resetleme fonksiyonu
    function resetForm() {
        noteTitleInput.value = '';
        noteContentInput.value = '';
        
        // Düzenleme modunu kapatma
        isEditing = false;
        currentNoteId = null;
        
        // Buton görünümlerini sıfırlama
        saveButton.innerHTML = '<i class="fas fa-save"></i> Kaydet';
        cancelButton.style.display = 'none';
    }
    
    // LocalStorage'dan notları alma
    function getNotes() {
        const notesJSON = localStorage.getItem('notes');
        return notesJSON ? JSON.parse(notesJSON) : [];
    }
    
    // Notları LocalStorage'a kaydetme
    function saveNotes(notes) {
        localStorage.setItem('notes', JSON.stringify(notes));
    }
    
    // LocalStorage'dan notları yükleme
    function loadNotes() {
        displayNotes();
    }
    
    // Notları ekranda gösterme
    function displayNotes() {
        const notes = getNotes();
        
        if (notes.length === 0) {
            notesList.innerHTML = '<div class="empty-notes">Henüz not eklenmedi.</div>';
            return;
        }
        
        // Notları yeni tarihten eskiye sıralama
        const sortedNotes = [...notes].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        // HTML oluşturma
        notesList.innerHTML = sortedNotes.map(note => {
            return `
                <div class="note-card" data-id="${note.id}">
                    <h3>${escapeHTML(note.title)}</h3>
                    <p>${escapeHTML(note.content)}</p>
                    <div class="date">${note.date}</div>
                    <div class="card-actions">
                        <button class="card-btn edit-btn" data-id="${note.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="card-btn delete-btn" data-id="${note.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Düzenleme ve silme butonlarına event listener ekleme
        attachNoteEventListeners();
    }
    
    // Not kartlarına event listener ekleme
    function attachNoteEventListeners() {
        // Düzenleme butonları
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const noteId = e.currentTarget.getAttribute('data-id');
                editNote(noteId);
            });
        });
        
        // Silme butonları
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const noteId = e.currentTarget.getAttribute('data-id');
                deleteNote(noteId);
            });
        });
    }
    
    // HTML içeriğini güvenli hale getirme (XSS önleme)
    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, 
            match => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[match]
        );
    }
});