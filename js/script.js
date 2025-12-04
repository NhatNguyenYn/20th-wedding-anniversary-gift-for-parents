document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. KHỞI TẠO THƯ VIỆN ---
    // Animation khi cuộn
    if (typeof AOS !== 'undefined') {
        AOS.init({ once: false, duration: 1000, offset: 80 });
    }
    
    // Lightbox xem ảnh
    if (typeof Fancybox !== 'undefined') {
        Fancybox.bind("[data-fancybox]", {});
    }

    // --- 2. MUSIC PLAYER (NHẠC NỀN) ---
    const musicBtn = document.getElementById('musicBtn');
    const bgMusic = document.getElementById('bgMusic');
    let isPlaying = false;

    if(musicBtn && bgMusic) {
        musicBtn.addEventListener('click', function() {
            if (isPlaying) {
                bgMusic.pause();
                musicBtn.classList.remove('music-rotating');
                musicBtn.innerHTML = '<i class="fas fa-music"></i>';
            } else {
                bgMusic.play();
                musicBtn.classList.add('music-rotating');
                musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }
            isPlaying = !isPlaying;
        });

        // Tự động phát nhạc nếu trình duyệt cho phép (khi click bất kỳ đâu)
        document.body.addEventListener('click', function() {
            if (!isPlaying) {
                bgMusic.play().then(() => {
                    isPlaying = true;
                    musicBtn.classList.add('music-rotating');
                    musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
                }).catch(e => console.log("Auto-play blocked"));
            }
        }, { once: true });
    }

    // --- 3. VINTAGE COUNTDOWN (ĐẾM NGƯỢC) ---
    // Sửa ngày cưới/kỷ niệm của bạn tại đây
    const targetDate = new Date("Dec 04, 2025 00:00:00").getTime();

    const timerInterval = setInterval(function() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Cập nhật DOM (nếu có phần tử ID tương ứng)
        if(document.getElementById("vc-days")) {
            document.getElementById("vc-days").innerText = days;
            document.getElementById("vc-hours").innerText = hours < 10 ? '0' + hours : hours;
            document.getElementById("vc-minutes").innerText = minutes < 10 ? '0' + minutes : minutes;
            document.getElementById("vc-seconds").innerText = seconds < 10 ? '0' + seconds : seconds;
        }

        if (distance < 0) {
            clearInterval(timerInterval);
            const countdownEl = document.getElementById("vintage-countdown");
            if(countdownEl) countdownEl.innerHTML = "<div style='font-size:1.5rem; color:#4F6335;'>HAPPY ANNIVERSARY!</div>";
        }
    }, 1000);

    // --- 4. FALLING EFFECT (HIỆU ỨNG RƠI) ---
    function createFallingElement() {
        const container = document.getElementById('falling-container');
        if(!container) return;

        const element = document.createElement('div');
        element.classList.add('falling-item');
        // Các icon sẽ rơi
        const icons = ['✨', '💛', '🌿', '🌸']; 
        element.innerText = icons[Math.floor(Math.random() * icons.length)];
        
        element.style.left = Math.random() * 100 + 'vw';
        element.style.fontSize = Math.random() * 15 + 10 + 'px';
        element.style.animationDuration = Math.random() * 3 + 5 + 's';
        element.style.opacity = Math.random();
        
        container.appendChild(element);

        setTimeout(() => element.remove(), 8000);
    }
    setInterval(createFallingElement, 500);

    // --- 5. GUESTBOOK (SỔ LƯU BÚT) - PHẦN QUAN TRỌNG NHẤT ---
    
    // [QUAN TRỌNG] Dán Link Web App Google Script của bạn vào đây:
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyrvCuohLvSONGrmK-1Vj6rgYEQJS2C6C5VKTxnUCEhEHDt-y9yiZztp6LqSHMndjTY/exec'; 

    const wishForm = document.getElementById('wish-form');
    const wishesContainer = document.getElementById('wishes-list-container');
    const loadingText = document.getElementById('loading-text'); // Đảm bảo trong HTML có thẻ <p id="loading-text">...

    // Hàm xử lý hiển thị HTML an toàn (chống lỗi hiển thị)
    function escapeHtml(text) {
        if (!text) return "";
        return text.replace(/[&<>"']/g, function(m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
        });
    }

    // Hàm tải dữ liệu
    function loadWishes() {
        if (!wishesContainer) return;

        // Thêm timestamp để ép trình duyệt tải mới, không dùng cache
        fetch(SCRIPT_URL + '?v=' + Date.now())
            .then(response => response.text()) // Lấy text trước để kiểm tra lỗi HTML
            .then(text => {
                let data;
                try {
                    data = JSON.parse(text); // Cố gắng chuyển sang JSON
                } catch (err) {
                    throw new Error("Server trả về lỗi HTML (Do chưa Deploy đúng hoặc sai link).");
                }

                // Ẩn chữ đang tải
                if (loadingText) loadingText.style.display = 'none';
                wishesContainer.innerHTML = '';

                // Kiểm tra dữ liệu rỗng
                if (!Array.isArray(data) || data.length === 0) {
                    wishesContainer.innerHTML = '<p class="text-center" style="color:#666;">Chưa có lời chúc nào. Hãy là người đầu tiên!</p>';
                    return;
                }

                // Hiển thị danh sách
                data.forEach(wish => {
                    const wishHTML = `
                        <div class="wish-item">
                            <h4 class="wish-name">${escapeHtml(wish.name)}</h4>
                            <div class="wish-date">${wish.date}</div>
                            <p class="wish-content">${escapeHtml(wish.message)}</p>
                        </div>
                    `;
                    wishesContainer.insertAdjacentHTML('beforeend', wishHTML);
                });
            })
            .catch(error => {
                console.error("Lỗi Guestbook:", error);
                if (loadingText) {
                    loadingText.innerHTML = `<span style="color:red;">Không tải được lời chúc.<br>Lỗi: ${error.message}</span>`;
                }
            });
    }

    // Hàm gửi lời chúc
    if (wishForm) {
        wishForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const nameInput = document.getElementById('guest-name');
            const msgInput = document.getElementById('guest-message');
            const submitBtn = document.querySelector('.btn-submit-wish');

            // Khóa nút
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'ĐANG GỬI...';
            submitBtn.disabled = true;

            const formData = new FormData();
            formData.append('Name', nameInput.value);
            formData.append('Message', msgInput.value);

            fetch(SCRIPT_URL, { method: 'POST', body: formData })
                .then(response => response.json())
                .then(data => {
                    if (data.result === 'success') {
                        nameInput.value = '';
                        msgInput.value = '';
                        alert('Gửi lời chúc thành công!');
                        loadWishes(); // Tải lại danh sách ngay lập tức
                    } else {
                        alert('Lỗi Server: ' + data.error);
                    }
                })
                .catch(error => {
                    alert('Lỗi kết nối. Vui lòng thử lại.');
                    console.error(error);
                })
                .finally(() => {
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Tự động tải lời chúc khi vào web
    loadWishes();
});
// --- JAVASCRIPT ĐỂ CO GIÃN TOÀN BỘ TRANG WEB ---

function scaleWebsite() {
    const container = document.querySelector('.mobile-container');
    if (!container) return;

    // Chiều rộng gốc của thiết kế
    const designWidth = 480; 

    // Chiều rộng hiện tại của cửa sổ trình duyệt
    const windowWidth = window.innerWidth;

    // Tính toán tỉ lệ co giãn
    // Nếu màn hình lớn hơn chiều rộng thiết kế, không co giãn (scale = 1)
    // Nếu màn hình nhỏ hơn, tính tỉ lệ co nhỏ lại
    const scale = windowWidth < designWidth ? windowWidth / designWidth : 1;

    // Áp dụng tỉ lệ co giãn vào container
    container.style.transform = `scale(${scale})`;

    // Điều chỉnh lại chiều cao của body để không bị khoảng trống
    // (do transform không ảnh hưởng đến layout)
    if (scale < 1) {
        document.body.style.height = (container.offsetHeight * scale) + 'px';
    } else {
        document.body.style.height = 'auto';
    }
}

// Gọi hàm khi trang tải lần đầu
window.addEventListener('load', scaleWebsite);

// Gọi lại hàm mỗi khi thay đổi kích thước cửa sổ (xoay ngang điện thoại)
window.addEventListener('resize', scaleWebsite);