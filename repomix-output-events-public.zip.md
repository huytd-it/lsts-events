This file is a merged representation of the entire codebase, combined into a single document by Repomix.
The content has been processed where security check has been disabled.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Security check has been disabled - content may contain sensitive information
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
events-public/
  event-detail/
    event-detail.js
    event-detail.php
  event-grid/
    event-grid.js
    event-grid.php
  css.php
  event-detail.css
  events.css
  family-tree.php
  home.css
  home.php
  js.php
  login.css
  search.php
```

# Files

## File: events-public/event-detail/event-detail.js
```javascript
/**
 * Class EventDetailViewer
 * Quản lý việc tải và hiển thị chi tiết của một sự kiện.
 */
class EventDetailViewer {
  constructor(eventId) {
    if (!eventId || eventId === 0) {
      this.showEventNotFound();
      return;
    }
    this.eventId = eventId;
    this.apiBaseUrl = '/api/v1';

    // Trạng thái tải ảnh cho gallery
    this.imageLoadingState = {
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      imageData: [],
      isComplete: false,
      imageLoadingState: false
    };
    // ✨ THÊM MỚI: Track current modal index
    this.currentImageIndex = null;

    // ✨ THÊM MỚI: Event listeners cleanup
    this.modalEventListeners = [];
    // Trạng thái tải thumbnail video
    this.videoThumbnailState = {
      totalVideos: 0,
      loadedThumbnails: 0,
      failedThumbnails: 0
    };
    // Cấu hình gallery
    this.galleryOptions = {
      showCaptions: true, // Luôn hiển thị caption mặc định
      captionOnHover: false, // Chỉ hiển thị khi hover nếu showCaptions là false
      showCaptionInModal: true // Hiển thị caption trong modal
    };
    this.init();
  }
  async init() {
    this.showEventDetailSkeleton();
    await this.loadEventById(this.eventId);
  }

  /**
   * Tải dữ liệu sự kiện từ API dựa vào ID
   */
  async loadEventById(eventId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/events/get?id=${eventId}&is_show=1`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const eventData = await response.json();

      if (eventData && eventData.id) {
        // Cập nhật title của trang
        document.title = `${eventData.event_name || eventData.title} - LSTS`;
        this.generateEventDetail(eventData);
      } else {
        this.showEventNotFound();
      }
    } catch (error) {
      console.error('Error loading event by ID:', error);
      this.showEventNotFound();
    }
  }

  /**
   * Hiển thị giao diện "khung xương" trong lúc chờ tải dữ liệu
   */
  showEventDetailSkeleton() {
    const eventDetailContent = document.getElementById('eventDetailContent');
    if (!eventDetailContent) return;

    eventDetailContent.innerHTML = `
            <div id="event_info">
                <div class="skeleton" style="height: 40px; width: 70%; margin: 20px auto; border-radius: 8px;"></div>
                <div class="skeleton" style="height: 20px; width: 30%; margin: 0 auto 30px; border-radius: 4px;"></div>
                <div style="padding: 20px;">
                    <div class="skeleton" style="height: 16px; width: 100%; margin-bottom: 12px; border-radius: 4px;"></div>
                    <div class="skeleton" style="height: 16px; width: 85%; margin-bottom: 12px; border-radius: 4px;"></div>
                    <div class="skeleton" style="height: 16px; width: 92%; border-radius: 4px;"></div>
                </div>
            </div>
            <div class="video-player-skeleton hidden" id="video-skeleton"></div>
            <div class="gallery-skeleton hidden" id="photos-skeleton">
                <div class="image-skeleton"></div><div class="image-skeleton"></div><div class="image-skeleton"></div>
            </div>
        `;
  }

  /**
   * Hiển thị thông báo khi không tìm thấy sự kiện
   */
  showEventNotFound() {
    const detailContainer = document.getElementById('eventDetailContainer');
    if (!detailContainer) return;

    detailContainer.innerHTML = `
            <div style="text-align: center; padding: 60px; color: var(--medium-gray);">
                <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                <h3>Event Not Found</h3>
                <p>This event may have been removed or does not exist.</p>
                <a href="/events" class="nav-btn" style="margin-top: 20px;">
                    ← Back to event list
                </a>
            </div>
        `;
  }

  /**
   * Tạo nội dung chi tiết cho sự kiện
   */
  generateEventDetail(event) {
    const eventDetailContent = document.getElementById('eventDetailContent');
    if (!eventDetailContent) return;

    // Clear skeleton
    eventDetailContent.innerHTML = '';

    const eventInfo = document.createElement('div');
    eventInfo.id = 'event_info';
    eventDetailContent.appendChild(eventInfo);

    // Render breadcrumb trước event info
    this.renderBreadcrumb(event, eventDetailContent);
    this.renderEventInfo(event, eventInfo);

    const { images, videos } = this.categorizeMedia(event.media);

    if (videos.length > 0) {
      const videosContainer = document.createElement('div');
      videosContainer.id = 'videos-container';
      videosContainer.className = 'container mt-4 bg-white p-0 ps-1 pb-1 pe-1 rounded';
      eventDetailContent.appendChild(videosContainer);
      this.renderVideoPlayer(videos, videosContainer);
      this.generateVideoThumbnails(videos);
    }

    if (images.length > 0) {
      const photosContainer = document.createElement('div');
      photosContainer.id = 'photos-container';
      eventDetailContent.appendChild(photosContainer);
      this.renderImageGallery(images, photosContainer);
    }
  }
  /**
     * Render breadcrumb cho sự kiện
     */
  renderBreadcrumb(event, container) {
    const breadcrumb = document.createElement('div');
    breadcrumb.className = 'event-breadcrumb';
    breadcrumb.style.cssText = `
      margin-bottom: 20px; 
      padding: 10px 0; 
      color: var(--medium-gray); 
      font-size: 14px;
    `;

    // Trích xuất năm từ event_date
    const year = this.extractYearFromDate(event.event_date || event.date) || 'Unknown';
    breadcrumb.innerHTML = `
      <a href="/events" style="color: var(--color-secondary); text-decoration: none;">Homepage</a>
      <span> › </span>
      <a href="/events/${year}">Year ${year}</a>
      <span> › </span>
      <strong>${event.event_name || event.title || 'Untitled Event'}</strong>
    `;

    // Chèn breadcrumb trước event_info
    container.insertBefore(breadcrumb, container.querySelector('#event_info'));
  }
  /**
   * Trích xuất năm từ chuỗi ngày
   */
  extractYearFromDate(dateString) {
    if (!dateString) return null;

    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      // Validate year
      if (year >= 1990 && year <= new Date().getFullYear() + 10) {
        return year;
      }
      return null;
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return null;
    }
  }
  renderEventInfo(event, container) {
    container.innerHTML = `
            <h2 class="d-flex w-100 justify-content-center text-dark fw-bold" style="color: var(--color-secondary);">
                ${event.event_name || event.title}
            </h2>
            <p class="d-flex justify-content-center text-dark">
                ${this.formatDate(event.event_date || event.date)}
            </p>
            <p class="p-3 text-description">
                ${event.description || ''}
            </p>
        `;
  }

  // ========== VIDEO PLAYER LOGIC ==========

  renderVideoPlayer(videos, container) {
    container.innerHTML = `
             <div class="video-wrapper row g-1">
                <!-- Main video player -->
                <div class="video-player col-xl-8 rounded">
                    <div class="video-info">
                        <h6 id="videoTitle"></h6>
                    </div>
                    <video autoplay="true" controls muted id="mainVideo">
                        <source src="" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>

                <!-- Video list -->
                <div class="video-list col">
                    <!-- Video items will be rendered here -->
                </div>
            </div>
        `;

    const videoListContainer = container.querySelector('.video-list');
    videos.forEach((video, index) => {
      const videoItem = this.createVideoListItem(video);
      videoListContainer.appendChild(videoItem);
      if (index === 0) {
        this.switchMainVideo(video);
        videoItem.classList.add('active');
      }
    });
  }

  createVideoListItem(video) {
    const videoItem = document.createElement('div');
    videoItem.className = 'video-list-item';
    videoItem.innerHTML = `
            <img src="/assets/images/video_placeholder.png" alt="Video Thumbnail" class="thumbnail">
            <div>
                <h6 class="mb-0 pe-1">${video.media_name}</h6>
            </div>
        `;
    videoItem.addEventListener('click', () => {
      this.switchMainVideo(video);
      document.querySelectorAll('.video-list-item').forEach(item => item.classList.remove('active'));
      videoItem.classList.add('active');
    });
    return videoItem;
  }

  switchMainVideo(video) {
    const mainVideo = document.getElementById('mainVideo');
    const videoTitle = document.getElementById('videoTitle');
    if (mainVideo && videoTitle) {
      mainVideo.src = video.file_path;
      videoTitle.textContent = video.media_name;
      mainVideo.load();
      mainVideo.play().catch(e => console.error("Autoplay was prevented.", e));
    }
  }


  createImageLink(image, index) {
    const link = document.createElement('a');
    link.href = image.file_path;
    link.className = 'picture';
    link.title = image.media_name || '';

    const img = document.createElement('img');
    img.src = image.file_path;
    img.alt = image.media_name || '';
    img.loading = 'lazy';
    link.appendChild(img);

    link.addEventListener('click', (e) => {
      e.preventDefault();
      this.openImageModal(index);
    });
    return link;
  }

  openImageModal(currentIndex) {
    // ✨ THÊM CHECK: Gallery phải ready
    if (!this.imageLoadingState.isGalleryReady) {
      console.warn('Gallery is still loading, please wait...');
      // Optional: Show user notification
      this.showNotification('Gallery is still loading, please wait...', 'warning');
      return;
    }

    // ✨ THÊM VALIDATION: Check bounds
    if (currentIndex < 0 || currentIndex >= this.imageLoadingState.totalImages) {
      console.warn('Invalid image index');
      return;
    }

    // ✨ SET current index
    this.currentImageIndex = currentIndex;

    const modal = this.createModalHtml(currentIndex);
    document.body.appendChild(modal);

    setTimeout(() => modal.classList.add('show'), 10);

    this.bindImageModalEvents(modal);

    // ✨ THÊM: Update navigation state
    this.updateModalNavigation();
  }
  createModalHtml(index) {
    const image = this.imageLoadingState.imageData[index];
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.setAttribute('data-current-index', index);

    modal.innerHTML = `
            <div class="image-modal-overlay">
                <div class="image-modal-content">
                    <button class="image-modal-close">&times;</button>
                    <button class="image-modal-prev" ${index === 0 ? 'disabled' : ''}>‹</button>
                    <button class="image-modal-next" ${index === this.imageLoadingState.totalImages - 1 ? 'disabled' : ''}>›</button>
                    
                    <img src="${image.file_path}" alt="${image.media_name || ''}" class="image-modal-img">
                    
                    <div class="image-modal-title">${image.media_name || ''}</div>
                   
                </div>
            </div>
        `;
    return modal;
  }

  bindImageModalEvents(modal) {
    // Clear previous listeners
    this.cleanupModalEvents();

    const closeBtn = modal.querySelector('.image-modal-close');
    const prevBtn = modal.querySelector('.image-modal-prev');
    const nextBtn = modal.querySelector('.image-modal-next');
    const overlay = modal.querySelector('.image-modal-overlay');

    // Close events
    const closeHandler = () => this.closeImageModal(modal);
    closeBtn.addEventListener('click', closeHandler);
    this.modalEventListeners.push({ element: closeBtn, event: 'click', handler: closeHandler });

    const overlayHandler = (e) => {
      if (e.target === overlay) this.closeImageModal(modal);
    };
    overlay.addEventListener('click', overlayHandler);
    this.modalEventListeners.push({ element: overlay, event: 'click', handler: overlayHandler });

    // Navigation events
    const prevHandler = (e) => {
      e.stopPropagation();
      this.navigateModal(-1);
    };
    const nextHandler = (e) => {
      e.stopPropagation();
      this.navigateModal(1);
    };

    prevBtn.addEventListener('click', prevHandler);
    nextBtn.addEventListener('click', nextHandler);
    this.modalEventListeners.push({ element: prevBtn, event: 'click', handler: prevHandler });
    this.modalEventListeners.push({ element: nextBtn, event: 'click', handler: nextHandler });

    // Keyboard events
    const keyHandler = (e) => {
      if (!document.querySelector('.image-modal.show')) return;

      switch (e.key) {
        case 'Escape':
          this.closeImageModal(modal);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.navigateModal(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.navigateModal(1);
          break;
      }
    };
    document.addEventListener('keydown', keyHandler);
    this.modalEventListeners.push({ element: document, event: 'keydown', handler: keyHandler });
  }

  closeImageModal(modal) {
    document.removeEventListener('keydown', modal.keyHandler);
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300); // Wait for transition
  }

  navigateImage(modal, direction) {
    let currentIndex = parseInt(modal.dataset.currentIndex, 10);
    const newIndex = currentIndex + direction;

    if (newIndex < 0 || newIndex >= this.imageLoadingState.totalImages) {
      return;
    }

    const image = this.imageLoadingState.imageData[newIndex];
    modal.dataset.currentIndex = newIndex;

    modal.querySelector('.image-modal-img').src = image.file_path;
    modal.querySelector('.image-modal-img').alt = image.media_name || '';
    modal.querySelector('.image-modal-title').textContent = image.media_name || '';
    modal.querySelector('.image-modal-prev').disabled = newIndex === 0;
    modal.querySelector('.image-modal-next').disabled = newIndex === this.imageLoadingState.totalImages - 1;
  }


  // ========== UTILITY METHODS ==========

  categorizeMedia(mediaArray) {
    const images = [];
    const videos = [];
    if (!mediaArray) return { images, videos };

    mediaArray.forEach(media => {
      const fileType = this.checkFileType(media.file_path);
      if (fileType === 'image') images.push(media);
      else if (fileType === 'video') videos.push(media);
    });
    return { images, videos };
  }

  checkFileType(filePath) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'jfif'];
    const videoExtensions = ['mp4', 'mkv', 'mov', 'avi', 'flv', 'wmv', 'webm'];
    const extension = filePath.split('.').pop().toLowerCase();

    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    return 'unknown';
  }

  formatDate(dateString) {
    if (!dateString) return '';
    // Check if ConvertDate utility is available
    if (typeof ConvertDate !== 'undefined') {
      return ConvertDate().toVi(dateString);
    }
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  }


  // ========== VIDEO PLAYER LOGIC ==========

  renderVideoPlayer(videos, container) {
    // Khởi tạo trạng thái thumbnail
    this.videoThumbnailState.totalVideos = videos.length;

    // Hiển thị skeleton cho video player và danh sách
    container.innerHTML = `
      <div class="video-wrapper row g-1">
        <!-- Main video player -->
        <div class="video-player col-xl-8 rounded">
          <div class="video-player-skeleton">
            <div class="loading-overlay">
              <div class="loading-spinner"></div>
            </div>
          </div>
          <div class="video-info">
            <h6 id="videoTitle" class="skeleton" style="height: 20px; width: 60%;"></h6>
          </div>
        </div>
        <!-- Video list -->
        <div class="video-list col">
          ${this.createVideoListSkeleton(videos.length)}
        </div>
      </div>
    `;

    const videoListContainer = container.querySelector('.video-list');
    // Render các mục video thực tế
    this.renderVideoListItems(videos, videoListContainer);

    // Load video đầu tiên
    if (videos.length > 0) {
      this.loadMainVideo(videos[0], container);
      // Đặt video đầu tiên là active
      setTimeout(() => {
        const firstItem = videoListContainer.querySelector('.video-list-item');
        if (firstItem) this.setActiveVideoItem(firstItem);
      }, 0);
    }
  }

  /**
   * Tạo skeleton cho danh sách video
   */
  createVideoListSkeleton(count) {
    let skeletonHTML = '';
    for (let i = 0; i < count; i++) {
      skeletonHTML += `
        <div class="video-list-item-skeleton">
          <div class="video-thumbnail-skeleton"></div>
          <div class="video-info-skeleton">
            <div class="video-title-skeleton"></div>
            <div class="video-subtitle-skeleton"></div>
          </div>
        </div>
      `;
    }
    return skeletonHTML;
  }

  /**
   * Load video chính vào player
   */
  loadMainVideo(video, container) {
    const videoPlayer = container.querySelector('.video-player');
    const videoElement = document.createElement('video');

    videoElement.setAttribute('autoplay', 'true');
    videoElement.setAttribute('controls', 'true');
    videoElement.setAttribute('muted', 'true');
    videoElement.id = 'mainVideo';
    videoElement.style.opacity = '0';
    //<h6 style="color:white" id="videoTitle">${video.media_name}</h6>
    videoElement.addEventListener('loadeddata', () => {
      videoPlayer.innerHTML = `
        <div class="video-info">
          
        </div>
      `;
      videoPlayer.appendChild(videoElement);
      videoElement.style.opacity = '1';
      videoElement.classList.add('fade-in-loaded');
      videoElement.play().catch(e => console.error("Autoplay was prevented.", e));
    });

    videoElement.src = video.file_path;
  }

  /**
   * Render các mục trong danh sách video
   */
  renderVideoListItems(videos, container) {
    videos.forEach((video, index) => {
      setTimeout(() => {
        const skeletonItem = container.children[index];
        if (skeletonItem) {
          const videoItem = this.createVideoListItem(video, index);
          container.replaceChild(videoItem, skeletonItem);
        }
      }, index * 200); // Delay để tạo hiệu ứng mượt
    });
  }

  createVideoListItem(video, index) {
    const videoItem = document.createElement('div');
    videoItem.className = 'video-list-item';
    videoItem.setAttribute('data-title', video.media_name);
    videoItem.setAttribute('data-src', video.file_path);
    videoItem.id = `media_${video.media_id || index}`; // Đảm bảo ID duy nhất

    videoItem.innerHTML = `
      <div class="thumbnail-container" style="position: relative;">
        <div class="video-thumbnail-skeleton"></div>
        <img src="" alt="Video Thumbnail" class="thumbnail" style="display: none;">
      </div>
      <div>
        <h6 class="mb-0 pe-1">${video.media_name}</h6>
      </div>
    `;

    videoItem.addEventListener('click', () => {
      this.switchMainVideo(video);
      this.setActiveVideoItem(videoItem);
    });

    videoItem.classList.add('fade-in-loaded');
    return videoItem;
  }

  /**
   * Đặt mục video đang được chọn là active
   */
  setActiveVideoItem(activeItem) {
    const videoListItems = document.querySelectorAll('.video-list-item');
    videoListItems.forEach(item => item.classList.remove('active'));
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }

  /**
   * Chuyển đổi video chính
   */
  switchMainVideo(video) {
    const mainVideo = document.getElementById('mainVideo');
    const videoTitle = document.getElementById('videoTitle');
    const videoPlayer = document.querySelector('.video-player');

    if (!mainVideo || !videoTitle || !videoPlayer) return;

    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
    videoPlayer.appendChild(loadingOverlay);

    const handleLoaded = () => {
      loadingOverlay.remove();
      mainVideo.removeEventListener('loadeddata', handleLoaded);
    };

    mainVideo.addEventListener('loadeddata', handleLoaded);
    mainVideo.src = video.file_path;
    mainVideo.load();
    mainVideo.play().catch(e => console.error("Autoplay was prevented.", e));
    videoTitle.textContent = video.media_name;
  }

  /**
   * Tạo thumbnails cho video
   */
  async generateVideoThumbnails(videos) {
    for (let i = 0; i < videos.length; i++) {
      try {
        const video = videos[i];
        const thumbnail = await this.getVideoThumbnail(video.file_path, i);
        this.updateVideoThumbnail(video.media_id || i, thumbnail);
        this.videoThumbnailState.loadedThumbnails++;
      } catch (error) {
        console.error('Error generating thumbnail for video:', videos[i].media_name, error);
        this.showThumbnailError(video.media_id || i);
        this.videoThumbnailState.failedThumbnails++;
      }
    }
  }

  /**
   * Lấy thumbnail từ video
   */
  getVideoThumbnail(videoUrl, index) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.crossOrigin = 'anonymous';
      video.src = videoUrl;

      video.addEventListener('loadeddata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        video.currentTime = 2; // Lấy frame ở giây thứ 2
      });

      video.addEventListener('seeked', () => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL('image/png');
          resolve(thumbnail);
        } catch (error) {
          reject(error);
        }
      });

      video.addEventListener('error', () => {
        reject(new Error('Failed to load video'));
      });

      video.load();
    });
  }

  /**
   * Cập nhật thumbnail cho video
   */
  updateVideoThumbnail(mediaId, thumbnail) {
    const thumbnailContainer = document.querySelector(`#media_${mediaId} .thumbnail-container`);
    if (thumbnailContainer) {
      const skeleton = thumbnailContainer.querySelector('.video-thumbnail-skeleton');
      const img = thumbnailContainer.querySelector('.thumbnail');

      if (skeleton && img) {
        img.src = thumbnail;
        img.style.display = 'block';
        img.classList.add('fade-in-loaded');

        img.addEventListener('load', () => {
          skeleton.style.opacity = '0';
          setTimeout(() => skeleton.remove(), 300);
        });
      }
    }
  }

  /**
   * Hiển thị lỗi khi tạo thumbnail thất bại
   */
  showThumbnailError(mediaId) {
    const thumbnailContainer = document.querySelector(`#media_${mediaId} .thumbnail-container`);
    if (thumbnailContainer) {
      const skeleton = thumbnailContainer.querySelector('.video-thumbnail-skeleton');
      if (skeleton) {
        skeleton.style.background = '#ffebee';
        skeleton.innerHTML = '<span style="color: #f44336; font-size: 12px;">⚠️</span>';
      }
    }
  }

  /**
   * Thêm skeleton cho card sự kiện (dùng trong trường hợp mở rộng hiển thị danh sách card)
   */
  showEventCardSkeleton(container) {
    if (!container) return;

    container.innerHTML = `
      <div class="event-card-skeleton">
        <div class="event-image-skeleton"></div>
        <div class="event-content-skeleton">
          <div class="skeleton" style="height: 20px; width: 80%; margin-bottom: 10px;"></div>
          <div class="skeleton" style="height: 16px; width: 50%; margin-bottom: 10px;"></div>
          <div class="skeleton" style="height: 16px; width: 90%; margin-bottom: 10px;"></div>
          <div class="skeleton" style="height: 16px; width: 70%;"></div>
        </div>
      </div>
    `;
  }

  /**
     * Tạo gallery controls (nút toggle caption)
     */
  createGalleryControls(container) {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'gallery-controls';
    controlsContainer.style.cssText = `
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 20px;
      padding: 10px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      backdrop-filter: blur(10px);
    `;

    // Toggle caption button
    const toggleCaptionBtn = document.createElement('button');
    toggleCaptionBtn.textContent = this.galleryOptions.showCaptions ? 'Hide Captions' : 'Show Captions';
    toggleCaptionBtn.className = 'nav-btn';
    toggleCaptionBtn.style.fontSize = '12px';
    toggleCaptionBtn.addEventListener('click', () => {
      this.toggleCaptionMode(!this.galleryOptions.showCaptions);
      toggleCaptionBtn.textContent = this.galleryOptions.showCaptions ? 'Hide Captions' : 'Show Captions';
    });

    //controlsContainer.appendChild(toggleCaptionBtn);

    // Chèn controls SAU photos container
    container.parentNode.insertBefore(controlsContainer, container.nextSibling);
  }

  /**
   * Toggle chế độ hiển thị caption
   */
  toggleCaptionMode(alwaysShow = false) {
    this.galleryOptions.showCaptions = alwaysShow;
    this.galleryOptions.captionOnHover = !alwaysShow;

    // Cập nhật caption hiện tại
    const captions = document.querySelectorAll('.image-caption');
    captions.forEach(caption => {
      if (alwaysShow) {
        caption.classList.add('always-show');
        caption.style.opacity = '1';
      } else {
        caption.classList.remove('always-show');
        caption.style.opacity = '0';
      }
    });
  }

  /**
   * Render gallery hình ảnh
   */
  renderImageGallery(images, container) {
    this.imageLoadingState.imageData = images;
    this.imageLoadingState.totalImages = images.length;
    this.imageLoadingState.loadedImages = 0;  // Reset counters
    this.imageLoadingState.failedImages = 0;
    this.imageLoadingState.isGalleryReady = false;

    // Thiết lập container
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
    container.style.gap = '12px';
    container.style.padding = '20px';
    container.style.background = 'rgba(255, 255, 255, 0.9)';
    container.style.borderRadius = '20px';
    container.style.marginTop = '30px';

    this.createGalleryControls(container);

    // Hiển thị skeleton
    let skeletonHTML = '';
    for (let i = 0; i < images.length; i++) {
      skeletonHTML += `<div class="image-skeleton" data-index="${i}"></div>`;
    }
    container.innerHTML = skeletonHTML;

    // ✨ THAY ĐỔI: Preload ảnh thay vì load từng cái
    this.preloadAllImages(images, container);
  }
  preloadAllImages(images, container) {
    const imagePromises = images.map((image, index) => {
      return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => {
          this.imageLoadingState.loadedImages++;
          resolve({ success: true, index, image, imgElement: img });
        };

        img.onerror = () => {
          this.imageLoadingState.failedImages++;
          console.warn(`Failed to load image at index ${index}:`, image.file_path);
          resolve({ success: false, index, image });
        };

        img.src = image.file_path;
      });
    });

    Promise.allSettled(imagePromises).then((results) => {
      const successRate = this.imageLoadingState.loadedImages / images.length;

      // Chỉ hiển thị gallery nếu ít nhất 70% ảnh load thành công
      if (successRate >= 0.3) {
        this.imageLoadingState.isGalleryReady = true;
        this.replaceSkeletonsWithImages(results, container);
      } else {
        this.showGalleryError(container, 'Too many images failed to load. Please refresh to try again.');
      }
    });
  }
  showGalleryError(container, message) {
    container.innerHTML = `
        <div class="gallery-error" style="
            grid-column: 1 / -1;
            text-align: center;
            padding: 40px;
            color: #666;
            background: rgba(255, 0, 0, 0.1);
            border-radius: 10px;
            border: 2px dashed #ff6b6b;
        ">
            <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
            <h4 style="color: #d63031; margin-bottom: 15px;">Gallery Loading Failed</h4>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn btn-primary btn-sm" style="margin-top: 15px;">
                🔄 Reload Page
            </button>
        </div>
    `;
  }
  replaceSkeletonsWithImages(results, container) {
    results.forEach((result, index) => {
      if (result.value.success) {
        const skeleton = container.querySelector(`[data-index="${index}"]`);
        if (skeleton) {
          // Tạo image link với stagger animation
          setTimeout(() => {
            const picture = this.createImageLink(result.value.image, index);
            container.replaceChild(picture, skeleton);
            picture.style.opacity = '1';
            picture.classList.add('fade-in-loaded');
          }, index * 50);
        }
      } else {
        // Remove skeleton for failed images
        const skeleton = container.querySelector(`[data-index="${index}"]`);
        if (skeleton) {
          skeleton.remove();
        }
      }
    });
  }
  /**
   * Tạo liên kết cho hình ảnh với caption
   */
  createImageLink(image, index) {
    function truncateText(text, maxLength) {
      if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
      }
      return text;
    }
    const link = document.createElement('a');
    link.href = image.file_path;
    link.className = 'picture';
    link.title = image.media_name || '';
    link.setAttribute('data-media-name', image.media_name || '');
    link.style.opacity = '0';
    link.style.transition = 'opacity 0.3s ease';
    link.style.display = 'block';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';
    imageContainer.style.position = 'relative';
    imageContainer.style.overflow = 'hidden';
    imageContainer.style.borderRadius = '10px';

    const img = document.createElement('img');
    img.src = image.file_path;
    img.alt = image.media_name || '';
    img.loading = 'lazy';
    img.style.width = '100%';
    img.style.height = '200px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '10px';
    img.style.transition = 'transform 0.3s ease';
    img.style.display = 'block';

    imageContainer.appendChild(img);

    // Thêm caption nếu có media_name
    if (image.media_name && image.media_name.trim()) {
      const caption = document.createElement('div');
      caption.className = 'image-caption';
      const MAX_CAPTION_LENGTH = 500; // Bạn có thể điều chỉnh độ dài tối đa tại đây
      caption.textContent = truncateText(image.media_name, MAX_CAPTION_LENGTH);

      if (this.galleryOptions.showCaptions) {
        caption.classList.add('always-show');
      }

      Object.assign(caption.style, {
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        background: this.galleryOptions.showCaptions
          ? 'rgba(0, 0, 0, 0.7)'
          : 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
        color: 'white',
        padding: this.galleryOptions.showCaptions ? '8px' : '20px 10px 10px',
        fontSize: this.galleryOptions.showCaptions ? '12px' : '14px',
        fontWeight: '600',
        textAlign: 'center',
        opacity: this.galleryOptions.showCaptions ? '1' : '0',
        transition: 'opacity 0.3s ease',
        borderRadius: '0 0 10px 10px',
        wordWrap: 'break-word',
        lineHeight: '1.3'
      });

      imageContainer.appendChild(caption);

      // Hiệu ứng hover nếu không luôn hiển thị caption
      if (!this.galleryOptions.showCaptions) {
        imageContainer.addEventListener('mouseenter', () => {
          img.style.transform = 'scale(1.05)';
          caption.style.opacity = '1';
        });
        imageContainer.addEventListener('mouseleave', () => {
          img.style.transform = 'scale(1)';
          caption.style.opacity = '0';
        });
      }
    }

    link.appendChild(imageContainer);

    link.addEventListener('click', (e) => {
      e.preventDefault();
      this.openImageModal(index);
    });

    return link;
  }
  navigateModal(direction) {
    if (!this.imageLoadingState.isGalleryReady) {
      console.warn('Gallery not ready for navigation');
      return;
    }

    const newIndex = this.currentImageIndex + direction;

    // ✨ STRICT BOUNDARY CHECK
    if (newIndex < 0 || newIndex >= this.imageLoadingState.totalImages) {
      // Optional: Add bounce effect
      this.addBounceEffect(direction);
      return;
    }

    this.currentImageIndex = newIndex;
    this.updateModalImage();
    this.updateModalNavigation();
  }

  updateModalImage() {
    const modal = document.querySelector('.image-modal.show');
    if (!modal) return;

    const image = this.imageLoadingState.imageData[this.currentImageIndex];
    if (!image) return;

    const img = modal.querySelector('.image-modal-img');
    const title = modal.querySelector('.image-modal-title');

    if (img) {
      img.src = image.file_path;
      img.alt = image.media_name || '';
    }

    if (title) {
      title.textContent = image.media_name || '';
    }

    // Update modal data attribute
    modal.setAttribute('data-current-index', this.currentImageIndex);
  }

  updateModalNavigation() {
    const modal = document.querySelector('.image-modal.show');
    if (!modal) return;

    const prevBtn = modal.querySelector('.image-modal-prev');
    const nextBtn = modal.querySelector('.image-modal-next');

    if (prevBtn) {
      const isFirst = this.currentImageIndex <= 0;
      prevBtn.disabled = isFirst;
      prevBtn.style.opacity = isFirst ? '0.3' : '1';
      prevBtn.style.pointerEvents = isFirst ? 'none' : 'auto';
    }

    if (nextBtn) {
      const isLast = this.currentImageIndex >= (this.imageLoadingState.totalImages - 1);
      nextBtn.disabled = isLast;
      nextBtn.style.opacity = isLast ? '0.3' : '1';
      nextBtn.style.pointerEvents = isLast ? 'none' : 'auto';
    }
  }

  addBounceEffect(direction) {
    const modal = document.querySelector('.image-modal-content');
    if (!modal) return;

    const translateX = direction > 0 ? '10px' : '-10px';
    modal.style.transform = `translateX(${translateX})`;

    setTimeout(() => {
      modal.style.transform = 'translateX(0)';
    }, 150);
  }

  cleanupModalEvents() {
    if (this.modalEventListeners) {
      this.modalEventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this.modalEventListeners = [];
    }
  }

  closeImageModal(modal) {
    this.cleanupModalEvents();
    modal.classList.remove('show');
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
    this.currentImageIndex = null;
  }

  // Optional: User notification helper
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'warning' ? '#ff9800' : '#2196f3'};
        color: white;
        padding: 12px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
}

// Initialize the viewer when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // The 'eventId' variable is passed from the PHP file
  if (typeof eventId !== 'undefined') {
    new EventDetailViewer(eventId);
    initStickyActionBar();
  } else {
    console.error('Event ID is not defined.');
  }
});

// STICKY NAVBAR FUNCTIONALITY
function initStickyActionBar() {
  const actionBar = document.getElementById('actionBar');
  // Lấy vị trí ban đầu của action bar
  const actionBarTop = actionBar.offsetTop;

  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > actionBarTop) {
      actionBar.classList.add('sticky');
    } else {
      actionBar.classList.remove('sticky');
    }
  }

  // Throttle scroll event cho performance
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll);
}
```

## File: events-public/event-detail/event-detail.php
```php
<?php
// Lấy ID sự kiện từ URL, đảm bảo là số nguyên
$eventId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Title sẽ được cập nhật bằng JavaScript -->
  <title>Event Detail - Lawrence S.Ting School</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <!-- Link đến file CSS chung và file CSS của trang chi tiết -->
  <link rel="stylesheet" href="/assets/styles/main.css">
  <link rel="stylesheet" href="/assets/styles/pages/event-detail.css">
</head>

<body>
  <div class="logo-main">
    <img src="/assets/images/logo.svg" alt="Lawrence S.Ting School">
  </div>

  <div class="timeline-container">
    <!-- Action Bar -->
    <div class="action-bar mt-3" id="actionBar">

      <div class="action-controls">
        <!-- Nút quay lại trang danh sách sự kiện -->
        <a href="/events/<?php echo $content['year']; ?>" class="nav-btn back-btn">
          ← Back to event list
        </a>

      </div>

      <div class="action-controls">
        <button class="nav-btn home-btn hidden" id="homeBtn">
          <i class="bi bi-house"></i> Home
        </button>
        <a href="/events/search" class="nav-btn search-btn">
          <i class="bi bi-search"></i>
          Search
        </a>
        <a href="/login" class="nav-btn login-btn">
        <i class="bi bi-box-arrow-in-right"></i>

          Login
        </a>
      </div>
    </div>
    <!-- Container chính cho trang chi tiết -->
    <div class="event-detail-container" id="eventDetailContainer">

      <div id="eventDetailContent">
        <!-- Nội dung chi tiết sự kiện sẽ được render ở đây bằng JavaScript -->
        <!-- Skeleton loader sẽ hiển thị trong lúc chờ tải dữ liệu -->
      </div>
    </div>

    <!-- Thư viện ảnh Modal (sẽ được tạo bởi JavaScript) -->
  </div>

  <!-- Nạp các thư viện JavaScript cần thiết -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="/assets/js/utils.js"></script> <!-- Giả sử file này chứa hàm ConvertDate -->
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.13/dayjs.min.js"></script>

  <script>
    // Truyền eventId từ PHP sang JavaScript
    const eventId = <?php echo $content['event_id']; ?>;
  </script>

  <!-- Nạp file JavaScript dành riêng cho trang chi tiết -->
  <script src="\pages\event-detail\event-detail.js"></script>

</body>

</html>
```

## File: events-public/event-grid/event-grid.js
```javascript
/*
To enable browser back button support in production environment,
uncomment the lines in setupBrowserBackButton() and saveState() methods,
and add this.setupBrowserBackButton() back to the init() method.
*/
// Thêm vào đầu file hoặc trong class
function createDateConverter() {
  if (typeof ConvertDate !== 'undefined') {
    return ConvertDate();
  }

  // Fallback converter
  return {
    toVi: function (dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
      } catch (e) {
        return dateString;
      }
    }
  };
}

// STICKY NAVBAR FUNCTIONALITY
function initStickyActionBar() {
  const actionBar = document.getElementById('actionBar');
  // Lấy vị trí ban đầu của action bar
  const actionBarTop = actionBar.offsetTop;

  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > actionBarTop) {
      actionBar.classList.add('sticky');
    } else {
      actionBar.classList.remove('sticky');
    }
  }

  // Throttle scroll event cho performance
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll);
}

class SlideshowModalViewer {
  constructor(slideshowInstance) {
    this.slideshow = slideshowInstance;
    this.modal = null;
    this.currentImageIndex = 0;

    // Zoom và pan state
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;

    this.init();
  }

  init() {
    this.modal = document.getElementById('slideshowModal');
    if (!this.modal) {
      console.error('Slideshow modal not found');
      return;
    }

    this.bindEvents();
  }

  bindEvents() {
    // Click vào slide image để mở modal
    document.addEventListener('click', (e) => {
      const slideImage = e.target.closest('.slide-image-container:not(.placeholder)');
      if (slideImage) {
        e.preventDefault();
        const imageIndex = parseInt(slideImage.getAttribute('data-image-index'));
        this.openModal(imageIndex);
      }
    });

    // Modal events
    this.modal.querySelector('.slideshow-modal-close').addEventListener('click', () => {
      this.closeModal();
    });

    this.modal.querySelector('.slideshow-modal-prev').addEventListener('click', () => {
      this.prevImage();
    });

    this.modal.querySelector('.slideshow-modal-next').addEventListener('click', () => {
      this.nextImage();
    });

    // Click overlay để đóng modal
    this.modal.querySelector('.slideshow-modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.closeModal();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.modal.classList.contains('show')) return;

      switch (e.key) {
        case 'Escape':
          this.closeModal();
          break;
        case 'ArrowLeft':
          this.prevImage();
          break;
        case 'ArrowRight':
          this.nextImage();
          break;
      }
    });

    // Zoom và pan events
    this.setupZoomAndPan();
  }
  setupZoomAndPan() {
    const imageWrapper = this.modal.querySelector('.slideshow-modal-image-wrapper');

    // Mouse wheel zoom
    imageWrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoom(delta, e.clientX, e.clientY);
    });

    // Touch events cho mobile
    let initialDistance = 0;
    let initialScale = 1;

    imageWrapper.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        // Pinch zoom
        initialDistance = this.getDistance(e.touches[0], e.touches[1]);
        initialScale = this.scale;
      } else if (e.touches.length === 1 && this.scale > 1) {
        // Pan
        this.startDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    });

    imageWrapper.addEventListener('touchmove', (e) => {
      e.preventDefault();

      if (e.touches.length === 2) {
        // Pinch zoom
        const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
        const scaleChange = currentDistance / initialDistance;
        this.setScale(initialScale * scaleChange);
      } else if (e.touches.length === 1 && this.isDragging) {
        // Pan
        this.drag(e.touches[0].clientX, e.touches[0].clientY);
      }
    });

    imageWrapper.addEventListener('touchend', () => {
      this.stopDrag();
    });

    // Mouse events cho desktop
    imageWrapper.addEventListener('mousedown', (e) => {
      if (this.scale > 1) {
        this.startDrag(e.clientX, e.clientY);
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.drag(e.clientX, e.clientY);
      }
    });

    document.addEventListener('mouseup', () => {
      this.stopDrag();
    });

    // Double click để reset zoom
    imageWrapper.addEventListener('dblclick', () => {
      this.resetZoom();
    });
  }

  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  zoom(delta, clientX, clientY) {
    const rect = this.modal.querySelector('.slideshow-modal-image-container').getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const newScale = Math.max(0.5, Math.min(5, this.scale * delta));
    this.setScale(newScale, x, y);
  }

  setScale(newScale, originX, originY) {
    if (originX && originY) {
      const scaleChange = newScale / this.scale;
      this.translateX = originX - scaleChange * (originX - this.translateX);
      this.translateY = originY - scaleChange * (originY - this.translateY);
    }

    this.scale = newScale;
    this.updateTransform();
  }

  startDrag(clientX, clientY) {
    this.isDragging = true;
    this.lastX = clientX;
    this.lastY = clientY;
    this.modal.querySelector('.slideshow-modal-image-wrapper').classList.add('dragging');
  }

  drag(clientX, clientY) {
    if (!this.isDragging) return;

    const deltaX = clientX - this.lastX;
    const deltaY = clientY - this.lastY;

    this.translateX += deltaX;
    this.translateY += deltaY;

    this.lastX = clientX;
    this.lastY = clientY;

    this.updateTransform();
  }

  stopDrag() {
    this.isDragging = false;
    this.modal.querySelector('.slideshow-modal-image-wrapper').classList.remove('dragging');
  }

  resetZoom() {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.updateTransform();
  }

  updateTransform() {
    const wrapper = this.modal.querySelector('.slideshow-modal-image-wrapper');
    wrapper.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }

  //5. Thêm Navigation Methods
  openModal(imageIndex) {
    this.currentImageIndex = imageIndex;
    this.resetZoom();
    this.updateModalContent();
    this.modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modal.classList.remove('show');
    document.body.style.overflow = '';
    this.resetZoom();
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.slideshow.slideshowData.length;
    this.resetZoom();
    this.updateModalContent();
  }

  prevImage() {
    this.currentImageIndex = this.currentImageIndex === 0
      ? this.slideshow.slideshowData.length - 1
      : this.currentImageIndex - 1;
    this.resetZoom();
    this.updateModalContent();
  }

  updateModalContent() {
    const imageData = this.slideshow.slideshowData[this.currentImageIndex];

    const modalImage = this.modal.querySelector('.slideshow-modal-image');
    const modalTitle = this.modal.querySelector('.slideshow-modal-title');
    const modalCounter = this.modal.querySelector('.slideshow-modal-counter');

    modalImage.src = imageData.image;
    modalImage.alt = imageData.title;
    modalTitle.textContent = imageData.title;
    modalCounter.textContent = `${this.currentImageIndex + 1} / ${this.slideshow.slideshowData.length}`;
  }
}
class DualLevelTimeline {
  constructor(currentYear = null) {
    // Core state
    this.currentLevel = currentYear ? 'year' : 'range';
    this.currentRange = null;
    this.currentYear = currentYear;
    this.currentEvent = null;

    // Data arrays
    this.rangeData = [];
    this.yearData = [];
    this.eventsData = [];
    this.allYears = [];
    // Image loading tracking
    this.imageLoadingState = {
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      imageData: [], // Store image data for modal
      isComplete: false
    };
    // Navigation state
    this.currentRangeIndex = 0;
    this.currentYearIndex = 0;
    this.currentYearGlobalIndex = 0;
    this.savedRangeIndex = 0;

    // Configuration
    this.itemsPerPage = {
      range: 6,
      year: 8
    };
    this.navigationState = {
      level: this.currentLevel
    };
    // Image gallery options
    this.galleryOptions = {
      showCaptions: false, // Always show captions
      captionOnHover: true, // Show only on hover
      showCaptionInModal: true
    };
    // Pagination
    this.pagination = {
      currentPage: 1,
      itemsPerPage: 12,
      totalItems: 0,
      totalPages: 0,
      hasMore: true
    };
    this.loadMoreMode = true; // Start in load more mode
    this.isLoadingMore = false;
    this.infiniteScrollEnabled = true; // Start with "All" button active

    // Slideshow properties
    this.slideshow = {
      currentSlide: 0,
      totalSlides: 0,
      totalSlidesWithClones: 0, // Thêm property này
      autoplayInterval: null,
      autoplayDelay: 4000,
      slideshowData: [],
      isLoading: true,
      isTransitioning: false // Prevent multiple transitions
    };
    // API configuration
    this.apiBaseUrl = '/api/v1';

    this.init();
  }
  destroy() {
    this.stopAutoplay();
    // Other cleanup if needed
  }
  // ========== INITIALIZATION ==========
  async init() {
    this.showTimelineLoading();
    initStickyActionBar();
    try {
      await this.generateAllYearsArray();
      this.generateRangeData();

      if (this.currentYear && this.allYears.includes(this.currentYear)) {
        const targetRange = this.findRangeContainingYear(this.currentYear);
        if (targetRange) {
          this.currentRange = targetRange;
          this.yearData = targetRange.years;
          this.currentYearGlobalIndex = this.allYears.indexOf(this.currentYear);
          this.currentLevel = 'year';
          this.saveRangePosition(targetRange);
          this.hideAllContainers();
          this.showContainer('yearTimeline', 'fade-in');
          this.showElement('backBtn');
          this.renderYearTimeline();
          this.showEventsContainer(this.currentYear);
          if (this.infiniteScrollEnabled) {
            this.loadAllEventsInAllMode();
          } else {
            this.loadEvents(this.currentYear, 1, false);
          }
          this.hideSlideshowContainer(); // Ẩn slideshow khi vào year timeline
          // Update URL for specific year
          this.updateBrowserUrl('year', this.currentYear);
        } else {
          console.warn(`Year ${this.currentYear} not found in any range. Falling back to range timeline.`);
          this.currentYear = null;
          this.currentLevel = 'range';
          this.renderRangeTimeline();
          this.showSlideshowContainer();
          this.updateBrowserUrl('range-default', null);
        }
      } else {
        this.renderRangeTimeline();
        this.showSlideshowContainer();
        this.updateBrowserUrl('range-default', null);
      }

      this.bindEvents();
      this.updateBackButtonState();
      this.initializeSlideshow();
      this.hideTimelineLoading();
      setTimeout(() => {
        this.modalViewer = new SlideshowModalViewer(this.slideshow);
      }, 1000);
    } catch (error) {
      console.error('Error initializing timeline:', error);
      this.showTimelineError();
    }
  }
  updateBrowserUrl(type, value) {
    try {
      let url = '/events';
      let state = {
        ...this.navigationState
      };

      if (type === 'range') {
        // Format: /2006-2010
        url += `/${value.replace(/\s/g, '').toLowerCase()}`; // Remove spaces and normalize
        state = {
          level: 'year',
          range: this.currentRange
        };
      } else if (type === 'year') {
        // Format: /year/2023
        url += `/${value}`;
        state = {
          level: 'events',
          range: this.currentRange,
          year: value
        };
      } else if (type === 'range-default') {
        // Format: /timeline
        state = {
          level: 'range'
        };
      }

      // Update browser history
      history.pushState(state, '', url);
    } catch (error) {
      console.error('Failed to update browser URL:', error);
    }
  }
  showTimelineLoading() {
    const container = document.getElementById('rangePoints');
    if (container) {
      container.innerHTML = `
                <div class="timeline-loading" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px;
                    color: var(--color-secondary);">
                    <div class="spinner"></div>
                    <p style="margin-top: 20px; font-weight: 600;">Đang tải dữ liệu timeline...</p>
                </div>
                `;
    }
  }

  hideTimelineLoading() {
    const container = document.getElementById('rangePoints');
    if (container) {
      const loading = container.querySelector('.timeline-loading');
      if (loading) {
        loading.remove();
      }
    }
  }

  showTimelineError() {
    const container = document.getElementById('rangePoints');
    if (container) {
      container.innerHTML = `
                <div class="timeline-error" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px;
                    color: #dc3545;
                    text-align: center;
                ">
                    <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                    <h4>Lỗi tải dữ liệu timeline</h4>
                    <p>Không thể kết nối đến server</p>
                    <button class="nav-btn" onclick="location.reload()" style="margin-top: 20px;">
                        Thử lại
                    </button>
                </div>
            `;
    }
  }
  generateRangeData() {
    if (this.allYears.length === 0) {
      console.warn('No years data available for generating ranges');
      return;
    }

    const minYear = Math.min(...this.allYears);
    const maxYear = Math.max(...this.allYears);

    // Clear existing ranges
    this.rangeData = [];

    // Generate ranges dựa trên actual data
    for (let start = minYear; start <= maxYear; start += 5) {
      const end = Math.min(start + 4, maxYear);
      const range = {
        label: `${start} - ${end}`,
        start: start,
        end: end,
        years: []
      };

      // Chỉ add years có trong API data
      for (let year = start; year <= end; year++) {
        if (this.allYears.includes(year)) {
          range.years.push(year);
        }
      }

      // Chỉ add range nếu có ít nhất 1 year
      if (range.years.length > 0) {
        this.rangeData.push(range);
      }
    }
  }

  async generateAllYearsArray() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/events/getYears`);
      const data = await response.json();

      if (Array.isArray(data)) {
        // Convert strings to numbers và sort
        this.allYears = data.map(year => parseInt(year, 10)).sort((a, b) => a - b);
      } else if (data && data.data && Array.isArray(data.data)) {
        // Nếu API wrap trong object
        this.allYears = data.data.map(year => parseInt(year, 10)).sort((a, b) => a - b);
      } else {
        console.warn('API getYears failed, using fallback');
        this.generateFallbackYears();
      }


    } catch (error) {
      console.error('Error loading years from API:', error);
      this.generateFallbackYears();
    }
  }

  generateFallbackYears() {
    // Fallback logic như cũ
    const currentYear = new Date().getFullYear();
    this.allYears = [];
    for (let year = 2006; year <= currentYear + 1; year++) {
      this.allYears.push(year);
    }
  }

  bindEvents() {
    // Navigation buttons
    this.bindElement('backBtn', 'click', () => this.handleSmartBackNavigation());
    // Range navigation
    this.bindElement('rangePrevBtn', 'click', () => this.navigateRange(-1));
    this.bindElement('rangeNextBtn', 'click', () => this.navigateRange(1));

    // Year navigation
    this.bindElement('yearPrevBtn', 'click', () => this.navigateYearSequential(-1));
    this.bindElement('yearNextBtn', 'click', () => this.navigateYearSequential(1));

    // Pagination
    this.bindElement('loadMoreBtn', 'click', () => this.loadMoreEvents());
    this.bindElement('prevPageBtn', 'click', () => this.navigatePage(-1));
    this.bindElement('nextPageBtn', 'click', () => this.navigatePage(1));
    // Thêm vào cuối phương thức bindEvents()
    this.bindElement('checkboxBigEvent', 'change', () => this.handleBigEventFilter());
    // All button for infinite scroll
    this.bindElement('allModeBtn', 'click', () => this.toggleAllMode());
    // Slideshow controls
    this.bindElement('slideshowPrevBtn', 'click', () => this.prevSlide());
    this.bindElement('slideshowNextBtn', 'click', () => this.nextSlide());

    // Infinite scroll for load more mode
    this.setupInfiniteScroll();

    // Add popstate event listener for browser navigation
    window.addEventListener('popstate', (event) => {
      if (event.state) {
        this.navigateToState(event.state);
      } else {
        // Default to range timeline if no state
        this.goToRangeTimeline();
      }
    });
  }

  bindElement(id, event, handler) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener(event, handler);
    }
  }

  // ========== INFINITE SCROLL FUNCTIONALITY ==========
  setupInfiniteScroll() {
    let scrollTimeout;
    
    const handleScroll = () => {
      // Only enable infinite scroll when "All" mode is enabled
      if (!this.infiniteScrollEnabled || this.currentLevel !== 'year' || !this.pagination.hasMore || this.isLoadingMore) {
        return;
      }

      const eventsContainer = document.getElementById('eventsContainer');
      if (!eventsContainer || eventsContainer.classList.contains('hidden')) {
        return;
      }

      // Calculate scroll position
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Load more when user is within 300px of bottom
      const threshold = 300;
      const isNearBottom = scrollTop + windowHeight >= documentHeight - threshold;

      if (isNearBottom) {
        this.loadMoreEvents();
      }
    };

    // Debounced scroll handler
    const debouncedScrollHandler = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    // Add scroll listener
    window.addEventListener('scroll', debouncedScrollHandler, { passive: true });
    
    // Store reference for cleanup if needed
    this.scrollHandler = debouncedScrollHandler;
  }
  // ========== ALL MODE TOGGLE ==========
  toggleAllMode() {
    this.infiniteScrollEnabled = !this.infiniteScrollEnabled;
    
    const allBtn = document.getElementById('allModeBtn');
    if (allBtn) {
      allBtn.classList.toggle('active', this.infiniteScrollEnabled);
      if (this.infiniteScrollEnabled) {
        allBtn.innerHTML = '<i class="bi bi-infinity"></i> ALL';
        allBtn.classList.add('all-active');
      } else {
        allBtn.innerHTML = '<i class="bi bi-list-ul"></i> ALL';
        allBtn.classList.remove('all-active');
      }
    }

    if (this.infiniteScrollEnabled) {
      // When enabling All mode: switch to load more mode, load all events, enable infinite scroll
      this.loadMoreMode = true;
      this.loadAllEventsInAllMode();
    } else {
      // When disabling All mode: switch to pagination mode, reset to first page
      this.loadMoreMode = false;
      this.resetPagination();
      this.loadEvents(this.currentYear, 1, false);
    }
    
    this.updatePaginationControls();
  }

  async loadAllEventsInAllMode() {
    // Reset and start loading all events progressively
    this.resetPagination();
    const eventsGrid = document.getElementById('eventsGrid');
    eventsGrid.innerHTML = '';
    
    // Load first page
    await this.loadEvents(this.currentYear, 1, false);
    
    // Then progressively load remaining pages
    let currentPage = 2;
    while (this.pagination.hasMore && this.infiniteScrollEnabled) {
      await this.loadEvents(this.currentYear, currentPage, true);
      currentPage++;
      
      // Add small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  disableAllMode() {
    if (this.infiniteScrollEnabled) {
      this.infiniteScrollEnabled = false;
      this.loadMoreMode = false; // Switch to pagination mode
      const allBtn = document.getElementById('allModeBtn');
      if (allBtn) {
        allBtn.classList.remove('active', 'all-active');
        allBtn.innerHTML = '<i class="bi bi-list-ul"></i> ALL';
      }
    }
  }

  // ========== BIG EVENT FILTER ==========
  handleBigEventFilter() {
    if (this.currentYear && this.currentLevel !== 'range') {
      this.disableAllMode(); // Disable All mode when filtering
      this.resetPagination();
      this.loadEvents(this.currentYear, 1, false);
    }
  }
  buildApiParams(year, page) {
    const start = (page - 1) * this.pagination.itemsPerPage;
    const length = this.pagination.itemsPerPage;
    const isBigEvent = this.getBigEventFilterValue();

    const params = {
      start_date: `${year}-01-01`,
      end_date: `${year}-12-31`,
      start: start.toString(),
      length: length.toString()
    };

    // Chỉ thêm is_big_event nếu có giá trị
    if (isBigEvent) {
      params.is_big_event = isBigEvent;
    }

    return new URLSearchParams(params).toString();
  }

  getBigEventFilterValue() {
    const checkbox = document.getElementById('checkboxBigEvent');
    return checkbox && checkbox.checked ? '1' : '';
  }
  // ========== TIMELINE RENDERING ==========
  renderRangeTimeline() {
    const container = document.getElementById('rangePoints');
    const {
      startIndex,
      endIndex
    } = this.getPageIndices('range');

    container.innerHTML = '';

    for (let i = startIndex; i < endIndex; i++) {
      const range = this.rangeData[i];
      const isActive = this.currentRange && range.label === this.currentRange.label;
      const point = this.createTimelinePoint(range.label, () => this.selectRange(range), isActive);
      container.appendChild(point);
    }

    this.updateNavigationButtons('range');
  }

  renderYearTimeline() {
    const container = document.getElementById('yearPoints');

    // Update range and year data
    const currentYearRange = this.findRangeContainingYear(this.currentYear);
    if (currentYearRange) {
      this.currentRange = currentYearRange;
      this.yearData = currentYearRange.years;
    }

    // Calculate display range
    const currentYearIndexInRange = this.yearData.indexOf(this.currentYear);
    const {
      startIndex,
      endIndex
    } = this.calculateYearDisplayRange(currentYearIndexInRange);

    container.innerHTML = '';

    for (let i = startIndex; i < endIndex; i++) {
      const year = this.yearData[i];
      const isActive = year === this.currentYear;
      const point = this.createTimelinePoint(year.toString(), () => this.selectYear(year), isActive);
      container.appendChild(point);
    }

    this.updateNavigationButtons('year');
  }

  createTimelinePoint(label, clickHandler, isActive = false) {
    const point = document.createElement('div');
    point.className = `timeline-point ${isActive ? 'active' : ''}`;
    point.innerHTML = `
                <div class="point-line"></div>
                <div class="point-circle"></div>
                <div class="point-label">${label}</div>
            `;

    // Attach click handler to the point-label
    const labelElement = point.querySelector('.point-label');
    if (labelElement) {
      labelElement.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent any default behavior
        clickHandler(); // Call the original handler (selectRange or selectYear)
      });
    }

    return point;
  }
  // ========== 2. THÊM SMART BACK NAVIGATION METHOD ==========
  handleSmartBackNavigation() {
    if (this.currentLevel === 'year' || this.currentLevel === 'detail') {
      // Từ year timeline hoặc detail -> về range timeline với active range
      this.goToRangeTimelineWithActiveRange(); // ← SỬA ĐỔI TẠI ĐÂY
    } else if (this.currentLevel === 'range') {
      // Từ range timeline -> về home
      this.goToHome();
    } else {
      // Default -> về home
      this.goToHome();
    }
  }

  // ========== 3. THÊM GO TO HOME METHOD ==========
  goToHome() {
    window.location.href = '/';
  }
  // ========== NAVIGATION LOGIC ==========
  selectRange(range) {
    this.saveRangePosition(range);
    this.currentRange = range;
    this.yearData = range.years;

    // Nếu đã có currentYear và nằm trong range này, giữ nguyên
    // Nếu không, chọn year đầu tiên
    if (!this.currentYear || !range.years.includes(this.currentYear)) {
      this.currentYear = range.years[0];
    }

    this.currentYearGlobalIndex = this.allYears.indexOf(this.currentYear);
    this.currentLevel = 'year';

    this.hideSlideshowContainer();
    this.resetPagination();

    this.saveState({
      level: 'year',
      range: range
    });

    // Transition to year timeline
    this.hideContainer('rangeTimeline');
    this.showContainer('yearTimeline', 'fade-in');
    this.updateBackButtonState(); // Cập nhật button state
    this.renderYearTimeline();

    this.showEventsContainer(this.currentYear);
    this.loadEvents(this.currentYear, 1, false);

    // Update browser URL
    this.updateBrowserUrl('range', range.label);
  }
  selectYear(year) {
    this.currentYear = year;
    this.currentYearGlobalIndex = this.allYears.indexOf(year);
    this.disableAllMode(); // Disable All mode when switching years
    this.resetPagination();

    this.updateYearActiveState(year);
    this.saveState({
      level: 'events',
      range: this.currentRange,
      year: year
    });

    // Đảm bảo button state được cập nhật
    this.updateBackButtonState();

    this.showEventsContainer(year);
    if (this.infiniteScrollEnabled) {
      this.loadAllEventsInAllMode();
    } else {
      this.loadEvents(year, 1, false);
    }

    // Update browser URL
    this.updateBrowserUrl('year', year);
  }
  navigateYearSequential(direction) {
    const newGlobalIndex = this.currentYearGlobalIndex + direction;

    if (newGlobalIndex < 0 || newGlobalIndex >= this.allYears.length) {
      return;
    }

    const newYear = this.allYears[newGlobalIndex];
    this.currentYear = newYear;
    this.currentYearGlobalIndex = newGlobalIndex;

    // Update range if needed
    const newRange = this.findRangeContainingYear(newYear);
    if (newRange && newRange !== this.currentRange) {
      this.currentRange = newRange;
      this.yearData = newRange.years;
    }

    this.renderYearTimeline();
    this.disableAllMode(); // Disable All mode when navigating years
    this.resetPagination();
    this.loadEvents(newYear, 1, false); // Always use regular load after disabling ALL
    this.updateEventsTitle(newYear);

    // Đảm bảo events container được hiển thị
    document.getElementById('eventsContainer').classList.remove('hidden');

    // Cập nhật button state (vẫn ở year level)
    this.updateBackButtonState();
  }

  navigateRange(direction) {
    const itemsToShow = this.itemsPerPage.range;
    const newIndex = this.currentRangeIndex + (direction * itemsToShow);

    if (newIndex >= 0 && newIndex < this.rangeData.length) {
      this.currentRangeIndex = newIndex;
      this.renderRangeTimeline();
    }
  }

  // ========== BACK NAVIGATION ==========

  goToRange() {
    this.currentLevel = 'range';
    this.currentRange = null;
    this.currentYear = null;
    this.currentRangeIndex = this.savedRangeIndex;

    // Tắt và reset tất cả media
    this.hideAllContainers();
    this.showContainer('rangeTimeline');
    this.hideElement('backBtn');
    this.renderRangeTimeline();

    // Hiện slideshow khi quay về range timeline
    this.showSlideshowContainer();
  }
  goToRangeTimeline() {


    this.currentLevel = 'range';
    this.currentRange = null;
    this.currentYear = null;
    this.currentRangeIndex = this.savedRangeIndex || 0;


    this.hideAllContainers();
    this.showContainer('rangeTimeline');
    this.updateBackButtonState();
    this.renderRangeTimeline();

    // Hiện slideshow khi quay về range timeline
    this.showSlideshowContainer();

    // Update URL
    this.updateBrowserUrl('range-default', null);
  }
  updateBackButtonState() {
    const backBtn = document.getElementById('backBtn');

    if (!backBtn) return;

    if (this.currentLevel === 'range') {
      // Ở range timeline -> button hiển thị "← Home"
      backBtn.innerHTML = '← Home';
      backBtn.classList.remove('hidden');
    } else if (this.currentLevel === 'year' || this.currentLevel === 'detail') {
      // Ở year timeline hoặc detail -> button hiển thị "← Back"
      backBtn.innerHTML = '← Back';
      backBtn.classList.remove('hidden');
    } else {
      // Hide button ở các trường hợp khác
      backBtn.classList.add('hidden');
    }
  }
  goToRangeTimelineWithActiveRange() {

    // Tìm range chứa currentYear
    const targetRange = this.findRangeContainingYear(this.currentYear);

    if (targetRange) {
      // Set range làm active
      this.currentRange = targetRange;

      // Tính toán currentRangeIndex để hiển thị range này
      const rangeIndex = this.rangeData.findIndex(r => r.label === targetRange.label);
      if (rangeIndex !== -1) {
        const itemsToShow = this.itemsPerPage.range;
        this.currentRangeIndex = Math.floor(rangeIndex / itemsToShow) * itemsToShow;
      }
    } else {
      // Fallback: reset về đầu
      this.currentRange = null;
      this.currentRangeIndex = 0;

    }

    // Reset year context
    this.currentLevel = 'range';
    this.currentYear = null;


    this.hideAllContainers();
    this.showContainer('rangeTimeline');
    this.updateBackButtonState();

    // Render range timeline với active range
    this.renderRangeTimelineWithActive();
    this.showSlideshowContainer();

    // Update URL
    this.updateBrowserUrl('range-default', null);
  }
  renderRangeTimelineWithActive() {
    const container = document.getElementById('rangePoints');
    const { startIndex, endIndex } = this.getPageIndices('range');

    container.innerHTML = '';

    for (let i = startIndex; i < endIndex; i++) {
      const range = this.rangeData[i];
      // Active range nếu trùng với currentRange
      const isActive = this.currentRange && range.label === this.currentRange.label;
      const point = this.createTimelinePoint(range.label, () => this.selectRange(range), isActive);
      container.appendChild(point);
    }

    this.updateNavigationButtons('range');
  }
  // ========== EVENTS LOADING ==========
  async loadEvents(year, page = 1, append = false) {
    const eventsGrid = document.getElementById('eventsGrid');

    // Set loading state to prevent multiple concurrent requests
    if (append) {
      this.isLoadingMore = true;
    }

    if (!append) {
      eventsGrid.innerHTML = '';
      //  this.pagination.currentPage = 1;
    }

    // Show appropriate loading state
    if (append) {
      this.showInfiniteScrollLoader();
    } else {
      this.showElement('eventsLoading');
    }

    try {
      const params = this.buildApiParams(year, page);
      const response = await fetch(`${this.apiBaseUrl}/events/getAll?${params}`);
      const data = await response.json();

      this.updatePaginationInfo(data, page);
      const events = data.data || [];
      if (append) {
        this.eventsData = [...this.eventsData, ...events];
      } else {
        this.eventsData = events;
      }

      // Hide appropriate loading state
      if (append) {
        this.hideInfiniteScrollLoader();
      } else {
        this.hideElement('eventsLoading');
      }
      this.renderEvents(events, append);
      this.updatePaginationControls();

    } catch (error) {
      this.showError('eventsLoading', 'Lỗi khi tải sự kiện');
      console.error('Error loading events:', error);
    } finally {
      // Reset loading state
      if (append) {
        this.isLoadingMore = false;
      }
    }
  }

  loadMoreEvents() {
    // Prevent multiple simultaneous loads
    if (this.isLoadingMore) {
      return;
    }
    this.loadEvents(this.currentYear, this.pagination.currentPage + 1, true);
  }

  navigatePage(direction) {
    const newPage = this.pagination.currentPage + direction;
    if (newPage >= 1 && newPage <= this.pagination.totalPages) {
      this.loadEvents(this.currentYear, newPage, false);
    }
  }


  // ========== EVENT RENDERING ==========

  // Method kiểm tra event có video không
  eventHasVideo(event) {
    if (!event.media || !Array.isArray(event.media)) {
      return false;
    }

    return event.media.some(media => {
      const fileType = this.checkFileType(media.file_path);
      return fileType === 'video';
    });
  }

  // Method tạo HTML cho tags
  generateEventTags(isBigEvent, hasVideo) {
    if (!isBigEvent && !hasVideo) {
      return '';
    }

    let tagsHTML = '<div class="event-tags">';

    if (isBigEvent) {
      tagsHTML += `
                <div class="event-tag big-event">
                    <span>⭐</span>
                    <span>Big Event</span>
                </div>
            `;
    }

    if (hasVideo) {
      tagsHTML += `
                <div class="event-tag has-video">
                    <i class="bi bi-camera-reels-fill"></i>
                    <span> Video</span>
                </div>
            `;
    }

    tagsHTML += '</div>';
    return tagsHTML;
  }
  // ***** CẬP NHẬT PHẦN XỬ LÝ CLICK VÀO EVENT CARD *****
  createEventCard(event) {
    function truncateText(text, maxLength) {
      if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
      }
      return text;
    }

    function stripHtmlTags(html) {
      if (!html) return '';
      // Create a temporary element to parse HTML and extract text content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.textContent || tempDiv.innerText || '';
    }

    const imageMedia = event.media?.find(
      m => this.checkFileType(m.file_path) === 'image'
    );

    const avatar = imageMedia?.file_path || '/assets/images/background-main.jpg';
    const eventTitle = (event.event_name || event.title).substring(0, 60);
    const eventDate = this.formatDate(event.event_date || event.date);
    const rawDescription = event.description || '';
    const plainTextDescription = stripHtmlTags(rawDescription);
    const eventDescription = truncateText(plainTextDescription, 100);
    const isBigEvent = event.is_big_event == 1;
    const hasVideo = event.media?.some(m => this.checkFileType(m.file_path) === 'video');
    const tagsHTML = this.generateEventTags(isBigEvent, hasVideo);

    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    // Thay vì data-event_id, chúng ta sẽ dùng thẻ a hoặc window.location
    eventCard.setAttribute('data-event-id', event.id);
    eventCard.setAttribute('data-event-date', event.event_date);

    eventCard.innerHTML = `
                <div class="event-image">
                    <img src="${avatar}" alt="${eventTitle}" class="event-thumbnail">
                </div>
                <div class="event-content">
                    <h4 class="event-title">${eventTitle}</h4>
                    <p class="event-date">${eventDate}</p>
                    ${tagsHTML}
                    <p class="event-description">${eventDescription}</p>
                    <a href="/events/${dayjs(event.event_date).format('YYYY')}/${event.id}" class="btn btn-primary btn-sm btn-view-detail">
                        View Details 
                    </a>
                </div>
            `;

    // Xử lý click trên card để chuyển trang
    eventCard.addEventListener('click', (e) => {
      // Chỉ chuyển trang nếu không click vào nút
      if (!e.target.classList.contains('btn-view-detail')) {
        window.location.href = `/events/${dayjs(event.event_date).format('YYYY')}/${event.id}`;
      }
    });

    return eventCard;
  }
  bindEventCardListeners(eventCard, event) {
    eventCard.addEventListener('click', (e) => {
      if (!e.target.classList.contains('btn-view-detail')) {
        this.showEventDetail(event);
      }
    });

    const viewDetailBtn = eventCard.querySelector('.btn-view-detail');
    viewDetailBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showEventDetail(event);
    });
  }

  initializeImageModal() {
    // Remove existing event listeners first
    const existingPictures = document.querySelectorAll('#photos-container .picture');
    existingPictures.forEach(picture => {
      const newPicture = picture.cloneNode(true);
      picture.parentNode.replaceChild(newPicture, picture);
    });

    // Add new event listeners
    const pictures = document.querySelectorAll('#photos-container .picture');
    pictures.forEach((picture, index) => {
      picture.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Get correct image source
        const imgSrc = picture.href;
        const imgTitle = picture.title || picture.querySelector('img')?.alt || '';

        this.openImageModal(imgSrc, imgTitle, index);
      });
    });
  }

  openImageModal(imageSrc, title, currentIndex) {
    const pictures = document.querySelectorAll('#photos-container .picture');
    const picture = pictures[currentIndex];
    const mediaName = picture?.getAttribute('data-media-name') || title || '';

    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.setAttribute('data-current-index', currentIndex);

    modal.innerHTML = `
            <div class="image-modal-overlay">
                <div class="image-modal-content">
                    <button class="image-modal-close">&times;</button>
                    <button class="image-modal-prev">‹</button>
                    <button class="image-modal-next">›</button>
                    <div class="image-modal-img-container">
                        <img src="${imageSrc}" alt="${mediaName}" class="image-modal-img">
                    </div>
                    <div class="image-modal-info">
                        <div class="image-modal-title">${mediaName}</div>
          
                    </div>
                </div>
            </div>
             `;

    document.body.appendChild(modal);
    this.bindImageModalEvents(modal, currentIndex);

    setTimeout(() => modal.classList.add('show'), 10);
  }

  bindImageModalEvents(modal, currentIndex) {
    // Store current index on modal element
    modal.currentIndex = currentIndex;

    // Close button
    const closeBtn = modal.querySelector('.image-modal-close');
    closeBtn.addEventListener('click', () => {
      this.closeImageModal(modal);
    });

    // Overlay click
    const overlay = modal.querySelector('.image-modal-overlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeImageModal(modal);
      }
    });

    // Navigation buttons
    const prevBtn = modal.querySelector('.image-modal-prev');
    const nextBtn = modal.querySelector('.image-modal-next');

    prevBtn.addEventListener('click', () => {
      this.navigateImage(modal, -1);
    });

    nextBtn.addEventListener('click', () => {
      this.navigateImage(modal, 1);
    });

    // Keyboard navigation
    const keyHandler = (e) => {
      e.preventDefault();
      if (e.key === 'Escape') {
        this.closeImageModal(modal);
      } else if (e.key === 'ArrowLeft') {
        this.navigateImage(modal, -1);
      } else if (e.key === 'ArrowRight') {
        this.navigateImage(modal, 1);
      }
    };

    document.addEventListener('keydown', keyHandler);
    modal.keyHandler = keyHandler; // Store for cleanup
  }

  navigateImage(modal, direction) {
    const currentIndex = modal.currentIndex || 0;
    var newIndex = currentIndex + direction;

    // Check boundaries
    if (newIndex < 0) {
      newIndex = this.imageLoadingState.totalImages
    }
    if (newIndex >= this.imageLoadingState.totalImages) {
      newIndex = 0;
    }

    // Update modal's current index
    modal.currentIndex = newIndex;
    modal.setAttribute('data-current-index', newIndex);

    // Get image data
    const imageData = this.imageLoadingState.imageData[newIndex];
    const isImageLoaded = newIndex < this.imageLoadingState.loadedImages;

    const imgContainer = modal.querySelector('.image-modal-img-container');
    const title = modal.querySelector('.image-modal-title');
    const counter = modal.querySelector('.image-modal-counter');

    // Update title and counter immediately
    title.textContent = imageData.media_name || '';
    //   counter.textContent = `${newIndex + 1} / ${this.imageLoadingState.totalImages}`;

    if (isImageLoaded) {
      // Show loaded image
      imgContainer.innerHTML = `
                <img src="${imageData.file_path}" 
                    alt="${imageData.media_name || ''}" 
                    class="image-modal-img">
            `;
    } else {
      // Show loading state
      imgContainer.innerHTML = `
                <div class="image-modal-loading">
                    <div class="loading-spinner"></div>
                    <p>Đang tải ảnh...</p>
                </div>
            `;

      // Load image
      this.loadImageForModal(modal, imageData, newIndex);
    }
  }
  openImageModalWithLoading(imageData, currentIndex) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.setAttribute('data-current-index', currentIndex);

    // Check if image is loaded
    const isImageLoaded = currentIndex < this.imageLoadingState.loadedImages;
    const imageSrc = isImageLoaded ? imageData.file_path : '';
    const mediaName = imageData.media_name || '';

    modal.innerHTML = `
                <div class="image-modal-overlay">
                    <div class="image-modal-content">
                        <button class="image-modal-close">&times;</button>
                        <button class="image-modal-prev">‹</button>
                        <button class="image-modal-next">›</button>
                        <div class="image-modal-img-container">
                            ${isImageLoaded ?
        `<img src="${imageSrc}" alt="${mediaName}" class="image-modal-img">` :
        `<div class="image-modal-loading">
                                    <div class="loading-spinner"></div>
                                    <p>Đang tải ảnh...</p>
                                </div>`
      }
                        </div>
                        <div class="image-modal-info">
                            <div class="image-modal-title">${mediaName}</div>
                        </div>
                    </div>
                </div>
            `;

    document.body.appendChild(modal);
    this.bindImageModalEventsEnhanced(modal, currentIndex);

    // Load image if not loaded yet
    if (!isImageLoaded) {
      this.loadImageForModal(modal, imageData, currentIndex);
    }

    setTimeout(() => modal.classList.add('show'), 10);
  }
  closeImageModal(modal) {
    if (!modal || !document.body.contains(modal)) {
      return;
    }

    modal.classList.remove('show');

    // Clean up event listener
    if (modal.keyHandler) {
      document.removeEventListener('keydown', modal.keyHandler);
      modal.keyHandler = null;
    }

    setTimeout(() => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    }, 300);
  }

  // ========== UTILITY METHODS ==========
  getPageIndices(type) {
    const itemsToShow = this.itemsPerPage[type];
    const currentIndex = type === 'range' ? this.currentRangeIndex : this.currentYearIndex;
    const dataLength = type === 'range' ? this.rangeData.length : this.yearData.length;

    return {
      startIndex: currentIndex,
      endIndex: Math.min(currentIndex + itemsToShow, dataLength)
    };
  }

  calculateYearDisplayRange(currentYearIndexInRange) {
    const itemsToShow = this.itemsPerPage.year;
    let startIndex = Math.max(0, currentYearIndexInRange - Math.floor(itemsToShow / 2));
    startIndex = Math.min(startIndex, Math.max(0, this.yearData.length - itemsToShow));

    return {
      startIndex,
      endIndex: Math.min(startIndex + itemsToShow, this.yearData.length)
    };
  }

  findRangeContainingYear(year) {
    return this.rangeData.find(range => year >= range.start && year <= range.end);
  }

  saveRangePosition(range) {
    const rangeIndex = this.rangeData.findIndex(r => r.label === range.label);
    if (rangeIndex !== -1) {
      this.savedRangeIndex = Math.floor(rangeIndex / this.itemsPerPage.range) * this.itemsPerPage.range;
    }
  }

  categorizeMedia(mediaArray) {
    const images = [];
    const videos = [];

    mediaArray.forEach(media => {
      const fileType = this.checkFileType(media.file_path);
      if (fileType === 'image') {
        images.push(media);
      } else if (fileType === 'video') {
        videos.push(media);
      }
    });

    return {
      images,
      videos
    };
  }

  checkFileType(filePath) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    const videoExtensions = ['mp4', 'mkv', 'mov', 'avi', 'flv', 'wmv', 'webm'];
    const extension = filePath.split('.').pop().toLowerCase();

    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    return 'unknown';
  }

  limitTitle(title, maxLength) {
    if (!title) return '';
    return title.length > maxLength ? title.substring(0, maxLength).trim() + '...' : title;
  }

  formatDate(dateString) {
    if (typeof ConvertDate !== 'undefined') {
      return ConvertDate().toVi(dateString);
    }
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (e) {
      return dateString;
    }
  }

  getEventAvatar(event) {
    return event.media && event.media.length > 0 ?
      event.media[0]?.file_path :
      '/assets/images/background-main.jpg';
  }



  // ========== UI HELPER METHODS ==========
  updateNavigationButtons(level) {
    if (level === 'range') {
      this.setButtonState('rangePrevBtn', this.currentRangeIndex === 0);
      this.setButtonState('rangeNextBtn',
        this.currentRangeIndex + this.itemsPerPage.range >= this.rangeData.length);
    } else if (level === 'year') {
      this.setButtonState('yearPrevBtn', this.currentYearGlobalIndex === 0);
      this.setButtonState('yearNextBtn',
        this.currentYearGlobalIndex === this.allYears.length - 1);
    }
  }

  updatePaginationControls() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const paginationNumbers = document.getElementById('paginationNumbers');
    
    console.log('updatePaginationControls:', {
      infiniteScrollEnabled: this.infiniteScrollEnabled,
      loadMoreMode: this.loadMoreMode,
      totalPages: this.pagination.totalPages,
      hasMore: this.pagination.hasMore,
      currentPage: this.pagination.currentPage
    });

    // Always show pagination bar with ALL button
    this.setElementDisplay(paginationNumbers, true);
    this.renderPaginationBar();

    // Hide load more button (replaced by pagination bar)
    this.setElementDisplay(loadMoreBtn, false);
  }
  renderPaginationBar() {
    const paginationNumbers = document.getElementById('paginationNumbers');
    if (!paginationNumbers) return;
    const current = this.pagination.currentPage;
    const total = this.pagination.totalPages;

    // Clear existing content
    paginationNumbers.innerHTML = '';

    // Create pagination bar: [All, <, 1, 2 .. 5, 6, >]
    const paginationBar = document.createElement('div');
    paginationBar.className = 'pagination-bar';

    // 1. "All" button - always first
    const allBtn = this.createAllModeButton();
    paginationBar.appendChild(allBtn);

    // Only show navigation if we have data and not in All mode
    if (total > 0 && !this.infiniteScrollEnabled) {
      // 2. Previous button "<"
      const prevBtn = this.createPaginationButton('‹', current - 1, current === 1);
      prevBtn.classList.add('pagination-prev');
      paginationBar.appendChild(prevBtn);

      // 3. Page numbers with ellipsis logic
      const pageButtons = this.generateSimplePageNumbers(current, total);
      pageButtons.forEach(button => {
        paginationBar.appendChild(button);
      });

      // 4. Next button ">"
      const nextBtn = this.createPaginationButton('›', current + 1, current === total);
      nextBtn.classList.add('pagination-next');
      paginationBar.appendChild(nextBtn);
    }

    paginationNumbers.appendChild(paginationBar);
  }

  generateSimplePageNumbers(current, total) {
    const buttons = [];
    
    if (total <= 6) {
      // Show all pages if 6 or fewer: [1, 2, 3, 4, 5, 6]
      for (let i = 1; i <= total; i++) {
        buttons.push(this.createPaginationButton(i, i, false, i === current));
      }
    } else {
      // Show with ellipsis: [1, 2, .., 5, 6] or [1, .., 4, 5, 6]
      
      // Always show first page
      buttons.push(this.createPaginationButton(1, 1, false, current === 1));
      
      if (current <= 3) {
        // Near beginning: [1, 2, 3, .., 5, 6]
        for (let i = 2; i <= 3; i++) {
          buttons.push(this.createPaginationButton(i, i, false, i === current));
        }
        buttons.push(this.createEllipsis());
        for (let i = total - 1; i <= total; i++) {
          buttons.push(this.createPaginationButton(i, i, false, i === current));
        }
      } else if (current >= total - 2) {
        // Near end: [1, 2, .., 4, 5, 6]
        buttons.push(this.createEllipsis());
        for (let i = total - 2; i <= total; i++) {
          if (i > 1) { // Don't duplicate page 1
            buttons.push(this.createPaginationButton(i, i, false, i === current));
          }
        }
      } else {
        // Middle: [1, .., 3, 4, 5, .., 6]
        buttons.push(this.createEllipsis());
        for (let i = current - 1; i <= current + 1; i++) {
          buttons.push(this.createPaginationButton(i, i, false, i === current));
        }
        buttons.push(this.createEllipsis());
        buttons.push(this.createPaginationButton(total, total, false, current === total));
      }
    }
    
    return buttons;
  }
  generatePageNumbers(current, total) {
    const buttons = [];
    const maxVisible = 5; // Số trang hiển thị tối đa (không tính ellipsis)

    if (total <= maxVisible + 2) {
      // Hiển thị tất cả nếu ít trang
      for (let i = 1; i <= total; i++) {
        buttons.push(this.createPaginationButton(i, i, false, i === current));
      }
    } else {
      // Logic phức tạp cho nhiều trang

      // Always show first page
      buttons.push(this.createPaginationButton(1, 1, false, current === 1));

      let startPage, endPage;

      if (current <= 3) {
        // Near beginning: 1, 2, 3, 4, ..., last
        startPage = 2;
        endPage = 4;
      } else if (current >= total - 2) {
        // Near end: 1, ..., n-3, n-2, n-1, n
        startPage = total - 3;
        endPage = total - 1;
      } else {
        // Middle: 1, ..., current-1, current, current+1, ..., last
        startPage = current - 1;
        endPage = current + 1;
      }

      // Add left ellipsis if needed
      if (startPage > 2) {
        buttons.push(this.createEllipsis());
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        buttons.push(this.createPaginationButton(i, i, false, i === current));
      }

      // Add right ellipsis if needed
      if (endPage < total - 1) {
        buttons.push(this.createEllipsis());
      }

      // Always show last page (if not already shown)
      if (total > 1) {
        buttons.push(this.createPaginationButton(total, total, false, current === total));
      }
    }

    return buttons;
  }
  createPaginationButton(text, page, disabled = false, active = false) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'pagination-btn';

    if (disabled) {
      button.classList.add('disabled');
      button.disabled = true;
    }

    if (active) {
      button.classList.add('active');
    }

    if (!disabled && !active) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToPage(page);
      });
    }

    return button;
  }

  createEllipsis() {
    const span = document.createElement('span');
    span.textContent = '...';
    span.className = 'pagination-ellipsis';
    return span;
  }

  createAllModeButton() {
    const button = document.createElement('button');
    button.id = 'allModeBtn';
    button.className = `pagination-btn all-mode-btn ${this.infiniteScrollEnabled ? 'active' : ''}`;
    
    // Make ALL button more prominent with special styling
    if (this.infiniteScrollEnabled) {
      button.innerHTML = '<i class="bi bi-infinity"></i> ALL';
      button.classList.add('all-active');
    } else {
      button.innerHTML = '<i class="bi bi-list-ul"></i> ALL';
      button.classList.remove('all-active');
    }
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleAllMode();
    });
    
    return button;
  }

  goToPage(page) {
    if (page < 1 || page > this.pagination.totalPages || page === this.pagination.currentPage) {
      return;
    }
    
    // Disable All mode when clicking pagination buttons
    this.disableAllMode();
    
    // Load events for the new page
    this.loadEvents(this.currentYear, page, false);
  }
  updatePaginationInfo(data, page) {
    this.pagination.totalItems = data.recordsFiltered || 0;
    this.pagination.totalPages = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
    this.pagination.hasMore = page < this.pagination.totalPages;
    this.pagination.currentPage = page;
    
    console.log('updatePaginationInfo:', {
      totalItems: this.pagination.totalItems,
      totalPages: this.pagination.totalPages,
      hasMore: this.pagination.hasMore,
      currentPage: this.pagination.currentPage,
      itemsPerPage: this.pagination.itemsPerPage,
      dataReceived: data
    });
  }

  updateYearActiveState(year) {
    document.querySelectorAll('#yearPoints .timeline-point').forEach(point => {
      point.classList.remove('active');
      if (point.querySelector('.point-label').textContent === year.toString()) {
        point.classList.add('active');
      }
    });
  }

  updateLevelIndicator(text) {
    const indicator = document.getElementById('levelIndicator');
    if (indicator) indicator.textContent = text;
  }

  updateEventsTitle(year) {
    const title = document.getElementById('eventsTitle');
    if (title) title.textContent = `Events in  ${year}`;
  }

  showEventsContainer(year) {
    const container = document.getElementById('eventsContainer');
    container.classList.remove('hidden');
    container.classList.add('fade-in');
    this.updateEventsTitle(year);

    // Đảm bảo loading state được hiển thị
    const eventsLoading = document.getElementById('eventsLoading');
    if (eventsLoading) {
      // eventsLoading.style.display = 'block';
    }
  }

  transitionToYearTimeline() {
    this.hideContainer('rangeTimeline');
    this.showContainer('yearTimeline', 'fade-in');
    this.showElement('backBtn');
    this.renderYearTimeline();
    // Đảm bảo events container luôn được hiện
    this.showContainer('eventsContainer', 'fade-in');
  }

  resetPagination() {
    this.pagination.currentPage = 1;
    this.isLoadingMore = false;
    // Don't automatically disable All mode here - let user control it
  }

  // ========== SLIDESHOW VISIBILITY ==========
  hideSlideshowContainer() {
    const container = document.getElementById('slideshowContainer');
    if (container) {
      container.classList.add('hidden');
      this.stopAutoplay();
    }
  }

  showSlideshowContainer() {
    const container = document.getElementById('slideshowContainer');
    if (container) {
      container.classList.remove('hidden');
      this.startAutoplay();
    }
  }
  // ========== INFINITE SCROLL LOADER ==========
  showInfiniteScrollLoader() {
    let loader = document.getElementById('infiniteScrollLoader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'infiniteScrollLoader';
      loader.className = 'infinite-scroll-loader';
      loader.innerHTML = `
        <div class="infinite-scroll-spinner"></div>
        <p style="margin-top: 10px; color: var(--color-secondary); font-size: 14px;">Loading more events...</p>
      `;
      loader.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        margin-top: 20px;
      `;
      
      const eventsContainer = document.getElementById('eventsContainer');
      eventsContainer.appendChild(loader);
    }
    loader.style.display = 'flex';
  }

  hideInfiniteScrollLoader() {
    const loader = document.getElementById('infiniteScrollLoader');
    if (loader) {
      loader.style.display = 'none';
    }
  }

  // ========== DOM HELPER METHODS ==========
  hideAllContainers() {
    ['rangeTimeline', 'yearTimeline', 'eventsContainer', 'eventDetailContainer'].forEach(id => {
      this.hideContainer(id);
    });
  }

  hideContainer(id) {
    const element = document.getElementById(id);
    if (element) {
      element.classList.add('hidden');
      element.classList.remove('fade-in', 'slide-up');
    }
  }

  showContainer(id, animationClass = null) {
    const element = document.getElementById(id);
    if (element) {
      element.classList.remove('hidden');
      if (animationClass) {
        element.classList.add(animationClass);
      }
    }
  }

  hideElement(id) {
    const element = document.getElementById(id);
    if (element) element.classList.add('hidden');
  }

  showElement(id) {
    const element = document.getElementById(id);
    if (element) {
      element.classList.remove('hidden');
    }
  }

  setElementDisplay(element, show) {
    if (element) {
      element.style.display = show ? 'flex' : 'none';
    }
  }

  setButtonState(id, disabled) {
    const button = document.getElementById(id);
    if (button) button.disabled = disabled;
  }

  showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `<p style="color: #dc3545;">${message}</p>`;
    }
  }

  // ========== STATE MANAGEMENT ==========
  saveState(state) {
    this.navigationState = state;
    // Enable in production:
    // try {
    //     history.pushState(state, '', window.location.pathname);
    // } catch (e) {
    //     console.log('History API not available');
    // }
  }

  navigateToState(state) {
    switch (state.level) {
      case 'range':
        this.goToRange();
        break;
      case 'year':
        this.selectRange(state.range);
        break;
      case 'events':
        this.selectRange(state.range);
        this.selectYear(state.year);
        break;
    }
  }

  // ========== SLIDESHOW METHODS ==========
  async initializeSlideshow() {
    await this.loadSlideshowData();
    this.renderSlideshow();
    this.startAutoplay();
  }

  async loadSlideshowData() {
    try {
      // Fetch featured images/events for slideshow
      const response = await fetch(`${this.apiBaseUrl}/event-media/getSlides`);
      const data = await response.json();

      if (data && data.data && Array.isArray(data.data)) {
        this.slideshow.slideshowData = this.processSlideshowData(data.data);
      } else {
        // Fallback: create empty slideshow
        this.slideshow.slideshowData = [];
      }

      this.slideshow.totalSlides = Math.ceil(this.slideshow.slideshowData.length / 2);
      this.slideshow.isLoading = false;

    } catch (error) {
      console.error('Error loading slideshow data:', error);
      this.slideshow.slideshowData = [];
      this.slideshow.isLoading = false;
    }
  }

  processSlideshowData(imagePaths) {
    return imagePaths.map((imagePath, index) => {
      // Extract year range from filename
      const filename = imagePath.split('/').pop(); // Get filename like "2008-2009.jpg"
      const yearRange = filename.replace('.jpg', '').replace('.jpeg', '').replace('.png', '');

      return {
        id: `slide_${index}`,
        title: `Academic Year ${yearRange}`,
        image: imagePath,
        yearRange: yearRange,
        index: index
      };
    });
  }
  renderSlideshow() {
    const slidesTrack = document.getElementById('slidesTrack');
    const indicators = document.getElementById('slideIndicators');

    if (this.slideshow.isLoading || this.slideshow.slideshowData.length === 0) {
      this.renderSlideshowSkeleton(slidesTrack, indicators);
      return;
    }

    // Clear existing content
    slidesTrack.innerHTML = '';
    indicators.innerHTML = '';

    // Calculate total slides
    this.slideshow.totalSlides = Math.ceil(this.slideshow.slideshowData.length / 2);

    if (this.slideshow.totalSlides <= 1) {
      // No need for infinite loop with single slide
      this.renderSingleSlideMode(slidesTrack, indicators);
      return;
    }

    // Create slides with clones for infinite loop
    this.createSlidesWithClones(slidesTrack);
    this.createIndicators(indicators);

    // Set initial position (start at first real slide, after clone)
    this.slideshow.currentSlide = 0;
    this.slideshow.totalSlidesWithClones = this.slideshow.totalSlides + 2; // 2 clones

    // Set track width
    slidesTrack.style.width = `${this.slideshow.totalSlidesWithClones * 10}%`;

    // Set initial position to first real slide
    this.setSlidePosition(1, false); // Index 1 = first real slide after clone

    setTimeout(() => {
      this.debugSlideshow();
    }, 100);
  }
  createSlidesWithClones(slidesTrack) {
    // Clone last slide và place at beginning
    const lastSlideClone = this.createSlide(this.slideshow.totalSlides - 1);
    lastSlideClone.classList.add('slide-clone');
    slidesTrack.appendChild(lastSlideClone);

    // Create all real slides
    for (let i = 0; i < this.slideshow.totalSlides; i++) {
      const slide = this.createSlide(i);
      slide.setAttribute('data-slide-index', i);
      slidesTrack.appendChild(slide);
    }

    // Clone first slide và place at end
    const firstSlideClone = this.createSlide(0);
    firstSlideClone.classList.add('slide-clone');
    slidesTrack.appendChild(firstSlideClone);
  }
  debugSlideshow() {
    const slidesTrack = document.getElementById('slidesTrack');
    const slides = slidesTrack.querySelectorAll('.slide-item');


    slides.forEach((slide, index) => {
      const images = slide.querySelectorAll('.slide-image-container:not(.placeholder)');
    });
  }
  createIndicators(indicators) {
    for (let i = 0; i < this.slideshow.totalSlides; i++) {
      const indicator = this.createSlideIndicator(i);
      indicators.appendChild(indicator);
    }
  }

  renderSingleSlideMode(slidesTrack, indicators) {
    const slide = this.createSlide(0);
    slide.style.width = '100%';
    slide.style.minWidth = '100%';
    slidesTrack.appendChild(slide);

    const indicator = this.createSlideIndicator(0);
    indicator.classList.add('active');
    indicators.appendChild(indicator);

    slidesTrack.style.width = '100%';
  }

  setSlidePosition(slideIndex, withTransition = true) {
    const slidesTrack = document.getElementById('slidesTrack');

    if (!withTransition) {
      slidesTrack.classList.add('no-transition');
    } else {
      slidesTrack.classList.remove('no-transition');
    }

    const translateX = -slideIndex * 100;
    slidesTrack.style.transform = `translateX(${translateX}%)`;

    // Remove no-transition class after a brief delay
    if (!withTransition) {
      setTimeout(() => {
        slidesTrack.classList.remove('no-transition');
      }, 50);
    }
  }
  createSlide(slideIndex) {
    const slide = document.createElement('div');
    slide.className = 'slide-item';

    const startIndex = slideIndex * 2;
    const items = this.slideshow.slideshowData.slice(startIndex, startIndex + 2);

    items.forEach((item, index) => {
      const imageContainer = document.createElement('a');
      imageContainer.className = 'slide-image-container';
      imageContainer.setAttribute('data-slide-index', slideIndex);
      imageContainer.setAttribute('data-image-index', startIndex + index);
      imageContainer.setAttribute('href', item.image);
      imageContainer.setAttribute('target', "_blank");
      const img = document.createElement('img');
      img.className = 'slide-image';
      img.src = item.image;
      img.alt = item.title;
      img.loading = 'lazy';
      imageContainer.appendChild(img);
      slide.appendChild(imageContainer);
    });

    // Nếu slide chỉ có 1 ảnh (slide cuối), thêm placeholder
    if (items.length === 1) {
      const placeholder = document.createElement('a');
      placeholder.className = 'slide-image-container placeholder';
      placeholder.style.opacity = '0';
      slide.appendChild(placeholder);
    }

    return slide;
  }

  createSlideIndicator(index) {
    const indicator = document.createElement('a');
    indicator.className = `slide-indicator ${index === 0 ? 'active' : ''}`;
    indicator.addEventListener('click', () => {
      this.goToSlide(index);
    });
    return indicator;
  }

  renderSlideshowSkeleton(slidesTrack, indicators) {
    slidesTrack.innerHTML = '';
    indicators.innerHTML = '';

    // Create skeleton slide
    const skeletonSlide = document.createElement('a');
    skeletonSlide.className = 'slide-item';

    for (let i = 0; i < 2; i++) {
      const skeletonContainer = document.createElement('a');
      skeletonContainer.className = 'slide-image-container';

      const skeleton = document.createElement('div');
      skeleton.className = 'slide-image-skeleton';

      skeletonContainer.appendChild(skeleton);
      skeletonSlide.appendChild(skeletonContainer);
    }

    slidesTrack.appendChild(skeletonSlide);

    // Create skeleton indicators
    for (let i = 0; i < 3; i++) {
      const indicator = document.createElement('div');
      indicator.className = `slide-indicator ${i === 0 ? 'active' : ''}`;
      indicators.appendChild(indicator);
    }
  }

  goToSlide(index) {
    if (this.slideshow.isTransitioning || this.slideshow.totalSlides <= 1) {
      return;
    }

    this.slideshow.currentSlide = index;
    this.slideshow.isTransitioning = true;

    // Move to real slide (index + 1 because of clone at beginning)
    this.setSlidePosition(index + 1, true);
    this.updateSlideIndicators();
    this.restartAutoplay();

    // Reset transition flag
    setTimeout(() => {
      this.slideshow.isTransitioning = false;
    }, 800); // Match transition duration
  }

  updateSlidePosition() {
    // Method này không còn cần thiết, thay thế bằng setSlidePosition
    if (this.slideshow.totalSlides <= 1) {
      return;
    }

    this.setSlidePosition(this.slideshow.currentSlide + 1, true);
  }

  updateSlideIndicators() {
    const indicators = document.querySelectorAll('.slide-indicator');
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.slideshow.currentSlide);
    });
  }
  nextSlide() {
    if (this.slideshow.isTransitioning || this.slideshow.totalSlides <= 1) {
      return;
    }

    this.slideshow.isTransitioning = true;

    if (this.slideshow.currentSlide === this.slideshow.totalSlides - 1) {
      // We're at the last real slide, go to last clone then reset
      this.setSlidePosition(this.slideshow.totalSlides + 1, true); // Go to first slide clone

      // Wait for animation to complete, then reset to first real slide
      setTimeout(() => {
        this.slideshow.currentSlide = 0;
        this.setSlidePosition(1, false); // Reset to first real slide without animation
        this.updateSlideIndicators();
        this.slideshow.isTransitioning = false;
      }, 800); // Match transition duration
    } else {
      // Normal next slide
      this.slideshow.currentSlide++;
      this.setSlidePosition(this.slideshow.currentSlide + 1, true);
      this.updateSlideIndicators();

      setTimeout(() => {
        this.slideshow.isTransitioning = false;
      }, 800);
    }
  }
  prevSlide() {
    if (this.slideshow.isTransitioning || this.slideshow.totalSlides <= 1) {
      return;
    }

    this.slideshow.isTransitioning = true;

    if (this.slideshow.currentSlide === 0) {
      // We're at the first real slide, go to first clone then reset
      this.setSlidePosition(0, true); // Go to last slide clone

      // Wait for animation to complete, then reset to last real slide
      setTimeout(() => {
        this.slideshow.currentSlide = this.slideshow.totalSlides - 1;
        this.setSlidePosition(this.slideshow.totalSlides, false); // Reset to last real slide without animation
        this.updateSlideIndicators();
        this.slideshow.isTransitioning = false;
      }, 800);
    } else {
      // Normal previous slide
      this.slideshow.currentSlide--;
      this.setSlidePosition(this.slideshow.currentSlide + 1, true);
      this.updateSlideIndicators();

      setTimeout(() => {
        this.slideshow.isTransitioning = false;
      }, 800);
    }
  }
  startAutoplay() {
    this.stopAutoplay();
    if (this.slideshow.totalSlides > 1) {
      this.slideshow.autoplayInterval = setInterval(() => {
        this.nextSlide(); // Sử dụng nextSlide thay vì method cũ
      }, this.slideshow.autoplayDelay);
    }
  }

  stopAutoplay() {
    if (this.slideshow.autoplayInterval) {
      clearInterval(this.slideshow.autoplayInterval);
      this.slideshow.autoplayInterval = null;
    }
  }

  restartAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }






  navigateSlideImage(modal, direction) {
    const currentIndex = modal.currentIndex || 0;
    const newIndex = currentIndex + direction;

    // Check boundaries
    if (newIndex < 0 || newIndex >= this.slideshow.slideshowData.length) {
      return;
    }

    // Update modal's current index
    modal.currentIndex = newIndex;
    modal.setAttribute('data-current-index', newIndex);

    // Get slide data
    const slideData = this.slideshow.slideshowData[newIndex];

    const imgContainer = modal.querySelector('.image-modal-img-container');
    const title = modal.querySelector('.image-modal-title');


    // Update content
    imgContainer.innerHTML = `
                    <img src="${slideData.image}" 
                        alt="${slideData.title}" 
                        class="image-modal-img fade-in-loaded">
                `;

    title.textContent = slideData.title;
    //    counter.textContent = `${newIndex + 1} / ${this.slideshow.slideshowData.length}`;

    // Update button states
    this.updateSlideModalNavigationButtons(modal);
  }

  updateSlideModalNavigationButtons(modal) {
    const currentIndex = modal.currentIndex || 0;
    const prevBtn = modal.querySelector('.image-modal-prev');
    const nextBtn = modal.querySelector('.image-modal-next');

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === this.slideshow.slideshowData.length - 1;
  }

  renderSlideshowSkeleton(slidesTrack, indicators) {
    slidesTrack.innerHTML = '';
    indicators.innerHTML = '';

    if (this.slideshow.slideshowData.length === 0 && !this.slideshow.isLoading) {
      // Show empty state
      const emptySlide = document.createElement('div');
      emptySlide.className = 'slide-item';
      emptySlide.innerHTML = `
                    <div style="width: 100%; text-align: center; padding: 60px; color: var(--medium-gray);">
                        <div style="font-size: 48px; margin-bottom: 20px;">📸</div>
                        <h3>Không có ảnh slideshow</h3>
                        <p>Chưa có dữ liệu slideshow để hiển thị</p>
                    </div>
                `;
      slidesTrack.appendChild(emptySlide);
      return;
    }

    // Create skeleton slide (existing code)
    const skeletonSlide = document.createElement('div');
    skeletonSlide.className = 'slide-item';

    for (let i = 0; i < 2; i++) {
      const skeletonContainer = document.createElement('div');
      skeletonContainer.className = 'slide-image-container';

      const skeleton = document.createElement('div');
      skeleton.className = 'slide-image-skeleton';

      skeletonContainer.appendChild(skeleton);
      skeletonSlide.appendChild(skeletonContainer);
    }

    slidesTrack.appendChild(skeletonSlide);

    // Create skeleton indicators
    for (let i = 0; i < 3; i++) {
      const indicator = document.createElement('div');
      indicator.className = `slide-indicator ${i === 0 ? 'active' : ''}`;
      indicators.appendChild(indicator);
    }
  }



  showEventNotFound() {
    const eventDetailContent = document.getElementById('eventDetailContent');
    eventDetailContent.innerHTML = `
            <div style="text-align: center; padding: 60px; color: var(--medium-gray);">
                <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                <h3>Không tìm thấy sự kiện</h3>
                <p>Sự kiện này có thể đã bị xóa hoặc không tồn tại</p>
                <button class="nav-btn" onclick="window.location.href='/'">
                    ← Quay về trang chủ
                </button>
            </div>
        `;
  }
  extractYearFromDate(dateString) {
    if (!dateString) return null;

    try {
      // Handle date format "2025-03-15"
      const date = new Date(dateString);
      const year = date.getFullYear();

      // Validate year is reasonable
      if (year >= 1990 && year <= new Date().getFullYear() + 10) {
        return year;
      }
      return null;
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return null;
    }
  }

  /**
 * Tìm image đầu tiên trong media array
 */
  getEventAvatar(event) {
    if (!event.media || !Array.isArray(event.media) || event.media.length === 0) {
      return '/assets/images/background-main.jpg';
    }

    // Tìm image đầu tiên trong media array
    const firstImage = event.media.find(media => {
      if (!media.file_path) return false;
      return this.checkFileType(media.file_path) === 'image';
    });

    return firstImage ? firstImage.file_path : '/assets/images/background-main.jpg';
  }

  /**
  * Tạo skeleton cho event card
  */
  createEventCardSkeleton() {
    const skeletonCard = document.createElement('div');
    skeletonCard.className = 'event-card event-card-skeleton';

    skeletonCard.innerHTML = `
      <div class="event-image">
          <div class="event-thumbnail skeleton"></div>
      </div>
      <div class="event-content">
          <div class="event-title skeleton" style="height: 24px; margin-bottom: 12px;"></div>
          <div class="event-date skeleton" style="height: 16px; width: 60%; margin-bottom: 15px;"></div>
          <div class="event-description">
              <div class="skeleton" style="height: 14px; width: 100%; margin-bottom: 8px;"></div>
              <div class="skeleton" style="height: 14px; width: 85%; margin-bottom: 8px;"></div>
              <div class="skeleton" style="height: 14px; width: 70%;"></div>
          </div>
          <div class="skeleton" style="height: 32px; width: 120px; margin-top: 20px; border-radius: 4px;"></div>
      </div>
  `;

    return skeletonCard;
  }

  /**
  * Tạo event card với image validation và loading states
  */

 
  processReplaceQueue() {
    if (this.isProcessingQueue || this.replaceQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    const eventsGrid = document.getElementById('eventsGrid');

    // Sort queue theo originalIndex để đảm bảo thứ tự
    this.replaceQueue.sort((a, b) => a.originalIndex - b.originalIndex);

    let processedCount = 0;

    const processNext = () => {
      if (processedCount >= this.replaceQueue.length) {
        this.isProcessingQueue = false;
        this.replaceQueue = [];
        return;
      }

      const item = this.replaceQueue[processedCount];
      const targetSkeleton = this.skeletonMap.get(item.index);

      if (targetSkeleton && targetSkeleton.parentNode === eventsGrid) {
        eventsGrid.replaceChild(item.eventCard, targetSkeleton);
        this.skeletonMap.delete(item.index);
      } else {
        eventsGrid.appendChild(item.eventCard);
      }

      // Animation với delay dựa trên thứ tự
      this.animateCardEntrance(item.eventCard, processedCount * 50);

      processedCount++;

      // Schedule next replacement
      setTimeout(processNext, 100); // 100ms delay giữa mỗi replacement
    };

    processNext();
  }
  animateCardEntrance(eventCard, delay = 0) {
    eventCard.style.opacity = '0';
    eventCard.style.transform = 'translateY(20px)';

    setTimeout(() => {
      requestAnimationFrame(() => {
        eventCard.style.transition = 'all 0.3s ease';
        eventCard.style.opacity = '1';
        eventCard.style.transform = 'translateY(0)';
      });
    }, delay);
  }
  /**
  * Debug method to check skeleton status
  */
  debugSkeletonStatus() {
    const skeletons = document.querySelectorAll('.event-card-skeleton');
    const realCards = document.querySelectorAll('.event-card:not(.event-card-skeleton)');

    skeletons.forEach((skeleton, index) => {
      console.log(`Skeleton ${index}:`, {
        hasParent: !!skeleton.parentNode,
        opacity: skeleton.style.opacity,
        index: skeleton.getAttribute('data-skeleton-index')
      });
    });

    if (skeletons.length > 0 && realCards.length > 0) {
      console.warn('⚠️ Skeletons and real cards coexist - cleanup needed');
      return false;
    }

    return true;
  }

  /**
  * Manual method to force cleanup (for debugging)
  */
  manualCleanupSkeletons() {
    console.log('🧹 Manual skeleton cleanup triggered');
    this.forceCleanupSkeletons();

    // Check status after cleanup
    setTimeout(() => {
      this.debugSkeletonStatus();
    }, 1000);
  }

  /**
  * Hiển thị skeleton cards
  */
  showEventSkeletons(container, count = 6) {
    for (let i = 0; i < count; i++) {
      const skeleton = this.createEventCardSkeleton();
      container.appendChild(skeleton);

      // Add stagger animation cho skeleton
      setTimeout(() => {
        skeleton.style.opacity = '1';
        skeleton.classList.add('fade-in');
      }, i * 100);
    }
  }

  /**
  * Enhanced method để kiểm tra và validate image
  */
  validateEventImage(imagePath) {
    if (!imagePath) return false;

    // Kiểm tra extension
    const fileType = this.checkFileType(imagePath);
    if (fileType !== 'image') return false;

    // Kiểm tra URL format
    try {
      new URL(imagePath, window.location.origin);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
  * Force cleanup all skeletons (emergency cleanup)
  */
  forceCleanupSkeletons() {
    const allSkeletons = document.querySelectorAll('.event-card-skeleton');
    console.log(`Force cleaning up ${allSkeletons.length} skeleton cards`);

    allSkeletons.forEach((skeleton, index) => {
      setTimeout(() => {
        if (skeleton.parentNode) {
          skeleton.style.transition = 'opacity 0.2s ease';
          skeleton.style.opacity = '0';
          setTimeout(() => skeleton.remove(), 200);
        }
      }, index * 50);
    });
  }

  /**
  * Check if skeleton cleanup is needed và auto cleanup
  */
  checkSkeletonCleanup() {
    // Cleanup remaining skeletons và map
    const remainingSkeletons = document.querySelectorAll('.event-card-skeleton');
    remainingSkeletons.forEach(skeleton => skeleton.remove());

    if (this.skeletonMap) {
      this.skeletonMap.clear();
    }
  }

  /**
  * Enhanced render events với better error handling
  */
  /**
   * GIẢI PHÁP: Sửa method renderEvents để đảm bảo thứ tự đúng
   */

  renderEvents(events, append = false) {
    const eventsGrid = document.getElementById('eventsGrid');

    //console.table(events);
    if (!append) {
      eventsGrid.innerHTML = '';
      this.showEventSkeletons(eventsGrid, events.length);

      this.skeletonMap = new Map();
      const skeletons = eventsGrid.querySelectorAll('.event-card-skeleton');
      skeletons.forEach((skeleton, idx) => {
        skeleton.setAttribute('data-skeleton-index', idx);
        this.skeletonMap.set(idx, skeleton);
      });

      // THAY ĐỔI 1: Tạo tất cả cards trước, không chờ image load
      this.replaceQueue = [];
      this.isProcessingQueue = false;

      // THAY ĐỔI 2: Tạo array chứa tất cả cards theo đúng thứ tự
      this.orderedCards = new Array(events.length);
      this.cardLoadingStatus = new Array(events.length).fill(false);
    }

    let completedCards = 0;
    const totalCards = events.length;

    // THAY ĐỔI 3: Tạo tất cả cards trước, lưu vào array theo index
    events.forEach((event, index) => {
      try {
        const eventCard = this.createEventCard(event);

        if (!append) {
          // Lưu card vào vị trí chính xác
          this.orderedCards[index] = eventCard;

          const imgElement = eventCard.querySelector('.event-thumbnail');

          if (imgElement) {
            const handleImageLoad = () => {
              // THAY ĐỔI 4: Đánh dấu card đã sẵn sàng
              this.cardLoadingStatus[index] = true;

              // THAY ĐỔI 5: Kiểm tra và thêm vào queue theo thứ tự
              this.checkAndAddToQueue();

              completedCards++;
              if (completedCards === totalCards) {
                setTimeout(() => this.checkSkeletonCleanup(), 500);
              }
            };

            if (imgElement.complete && imgElement.naturalHeight !== 0) {
              handleImageLoad();
            } else {
              imgElement.onload = handleImageLoad;
              imgElement.onerror = () => {
                console.warn(`Image failed to load for event ${event.id}`);
                handleImageLoad();
              };
            }
          } else {
            // Không có ảnh - sẵn sàng ngay
            this.cardLoadingStatus[index] = true;
            this.checkAndAddToQueue();
            completedCards++;
          }
        } else {
          eventsGrid.appendChild(eventCard);
          this.animateCardEntrance(eventCard, 0);
          completedCards++;
        }

      } catch (error) {
        console.error(`Error creating event card at index ${index}:`, error);
        if (!append) {
          const targetSkeleton = this.skeletonMap.get(index);
          if (targetSkeleton && targetSkeleton.parentNode === eventsGrid) {
            targetSkeleton.remove();
            this.skeletonMap.delete(index);
          }
        }
        completedCards++;
      }
    });

    const safetyTimeout = (totalCards * 150) + 5000;
    setTimeout(() => {
      this.forceCleanupSkeletons();
    }, safetyTimeout);
  }

  /**
   * THAY ĐỔI 6: Method mới để kiểm tra và thêm cards vào queue theo thứ tự
   */
  checkAndAddToQueue() {
    if (!this.orderedCards || !this.cardLoadingStatus) return;

    // Tìm tất cả cards sẵn sàng từ đầu mảng
    for (let i = 0; i < this.cardLoadingStatus.length; i++) {
      if (this.cardLoadingStatus[i] && this.orderedCards[i]) {
        // Kiểm tra xem card này đã trong queue chưa
        const alreadyInQueue = this.replaceQueue.some(item => item.originalIndex === i);

        if (!alreadyInQueue) {
          this.replaceQueue.push({
            index: i,
            eventCard: this.orderedCards[i],
            originalIndex: i
          });

          // Xóa khỏi orderedCards để tránh duplicate
          this.orderedCards[i] = null;
        }
      }
    }

    // Bắt đầu xử lý queue nếu chưa bắt đầu
    if (!this.isProcessingQueue && this.replaceQueue.length > 0) {
      this.processReplaceQueue();
    }
  }

  /**
   * THAY ĐỔI 7: Cập nhật processReplaceQueue để đảm bảo thứ tự chính xác
   */
  processReplaceQueue() {
    if (this.isProcessingQueue || this.replaceQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    const eventsGrid = document.getElementById('eventsGrid');

    // QUAN TRỌNG: Sort queue theo originalIndex để đảm bảo thứ tự
    this.replaceQueue.sort((a, b) => a.originalIndex - b.originalIndex);

    let processedCount = 0;

    const processNext = () => {
      if (processedCount >= this.replaceQueue.length) {
        this.isProcessingQueue = false;
        this.replaceQueue = [];
        return;
      }

      const item = this.replaceQueue[processedCount];
      const targetSkeleton = this.skeletonMap.get(item.originalIndex); // Sử dụng originalIndex

      if (targetSkeleton && targetSkeleton.parentNode === eventsGrid) {
        eventsGrid.replaceChild(item.eventCard, targetSkeleton);
        this.skeletonMap.delete(item.originalIndex);
      } else {
        eventsGrid.appendChild(item.eventCard);
      }

      // Animation với delay dựa trên thứ tự ban đầu
      this.animateCardEntrance(item.eventCard, item.originalIndex * 50);

      processedCount++;

      // Schedule next replacement với delay ngắn hơn
      setTimeout(processNext, 50);
    };

    processNext();
  }

  /**
   * THAY ĐỔI 8: Method cleanup để reset state
   */
  checkSkeletonCleanup() {
    // Cleanup remaining skeletons và map
    const remainingSkeletons = document.querySelectorAll('.event-card-skeleton');
    remainingSkeletons.forEach(skeleton => skeleton.remove());

    if (this.skeletonMap) {
      this.skeletonMap.clear();
    }

    // Reset arrays
    this.orderedCards = null;
    this.cardLoadingStatus = null;
  }

}


// Initialize the timeline when the page loads
// Sửa lại ở cuối file
document.addEventListener('DOMContentLoaded', async () => {
  try {

    const timeline = new DualLevelTimeline(currentYear);
    // initStickyActionBar();
    // Constructor đã gọi this.init() async
    window.timelineInstance = timeline; // For debugging
  } catch (error) {
    console.error('Failed to initialize timeline:', error);

    // Show global error
    const container = document.querySelector('.timeline-container');
    if (container) {
      container.innerHTML = `
            <div class="global-error" style="text-align: center; padding: 100px; color: #dc3545;">
                <h2>Không thể khởi tạo timeline</h2>
                <p>Vui lòng thử lại sau</p>
                <button class="nav-btn" onclick="location.reload()">Tải lại</button>
            </div>
        `;
    }
  }
});
```

## File: events-public/event-grid/event-grid.php
```php
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lawrence S.Ting School Timeline</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="/assets/styles/main.css">
  <link rel="stylesheet" href="/assets/styles/pages/events.css">
</head>

<body>
  <div class="logo-main">
    <img src="/assets/images/logo.svg" alt="Lawrence S.Ting School">
  </div>

  <!-- Slideshow Modal Viewer -->
  <div class="slideshow-modal" id="slideshowModal">
    <div class="slideshow-modal-overlay">
      <div class="slideshow-modal-content">
        <!-- Close button -->
        <button class="slideshow-modal-close"><i class="bi bi-x"></i></button>

        <!-- Navigation buttons -->
        <button class="slideshow-modal-nav slideshow-modal-prev"><i class="bi bi-arrow-left"></i></button>
        <button class="slideshow-modal-nav slideshow-modal-next"><i class="bi bi-arrow-right"></i></button>

        <!-- Image container with zoom support -->
        <div class="slideshow-modal-image-container">
          <div class="slideshow-modal-image-wrapper">
            <img class="slideshow-modal-image" src="" alt="">
          </div>
        </div>

        <!-- Image info -->
        <div class="slideshow-modal-info">
          <div class="slideshow-modal-title"></div>
          <div class="slideshow-modal-counter"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="timeline-container">

    <div class="timeline-header">
      <h1 class="landing-title">Lawrence S.Ting School</h1>
    </div>
    <!-- Action Bar -->
    <div class="action-bar" id="actionBar">

      <div class="action-controls">
        <button class="nav-btn back-btn hidden" id="backBtn">
          <i class="bi bi-arrow-left"></i> Back
        </button>
      </div>

      <div class="action-controls">

        <div class="big-event-filter">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="checkboxBigEvent">
            <label class="form-check-label" for="checkboxBigEvent">Big Event</label>
          </div>
        </div>
        <button class="nav-btn home-btn hidden" id="homeBtn">
          <i class="bi bi-house"></i> Home
        </button>
        <a href="/events/search" class="nav-btn search-btn">
          <i class="bi bi-search"></i>
          Search
        </a>
        <?php
        if (!isset($content['is_logged_in']) || !$content['is_logged_in']) {
          echo '<a href="/login" class="nav-btn login-btn">
            <i class="bi bi-box-arrow-in-right"></i>Login</a>';
        }else {
          echo '<a href="/admin/events" class="nav-btn login-btn">
            <i class="bi bi-box-arrow-in-right"></i>Admin Portal</a>';
        }
        ?>


      </div>
    </div>

    <div class="action-bar-spacer"></div>
    <!-- Range Timeline (Level 1) -->
    <div class="timeline-wrapper" id="rangeTimeline">

      <div class="timeline">
        <div class="timeline-navigation">
          <button class="nav-btn" id="rangePrevBtn">
            <i class="bi bi-arrow-left"></i>
          </button>
          <button class="nav-btn" id="rangeNextBtn">
            <i class="bi bi-arrow-right"></i>
          </button>
        </div>
        <div class="timeline-line"></div>
        <div class="timeline-points" id="rangePoints">
          <!-- Range points will be generated here -->
        </div>
      </div>
    </div>

    <!-- Year Timeline (Level 2) -->
    <div class="timeline-wrapper hidden" id="yearTimeline">

      <div class="timeline">
        <div class="timeline-navigation">
          <button class="nav-btn" id="yearPrevBtn">
            <i class="bi bi-arrow-left"></i>
          </button>
          <button class="nav-btn" id="yearNextBtn">
            <i class="bi bi-arrow-right"></i>
          </button>
        </div>
        <div class="timeline-line"></div>
        <div class="timeline-points" id="yearPoints">
          <!-- Year points will be generated here -->
        </div>
      </div>
    </div>

    <!-- Events Container -->
    <div class="events-container hidden" id="eventsContainer">
      <h3 style="color: var(--color-secondary); margin-bottom: 20px; font-size: 1.8rem; font-weight: bold;"
        id="eventsTitle">Events in 2024</h3>
      <div class="loading" id="eventsLoading">
        <div class="spinner"></div>
        <p style="margin-top: 20px;">Loading events...</p>
      </div>
      <div class="events-grid" id="eventsGrid">
        <!-- Events will be loaded here -->
      </div>

      <!-- Thêm vào sau events-grid -->
      <div class="pagination-controls" id="paginationControls" style="margin-top: 30px; text-align: center;">
        <!-- Load More Button -->
        <button class="nav-btn" id="loadMoreBtn" style="display: none;">
          Load more events
        </button>

        <!-- Pagination Numbers -->
        <div class="pagination-numbers" id="paginationNumbers" style="display: none;">
          <button class="nav-btn" id="prevPageBtn" style="margin-right: 10px;"><i class="bi bi-arrow-left"></i></button>
          <span id="pageInfo"
            style="margin: 0 20px; color: var(--color-secondary); font-weight: bold;"></span>
          <button class="nav-btn" id="nextPageBtn" style="margin-left: 10px;"><i class="bi bi-arrow-right"></i></button>
        </div>

      </div>
    </div>

    <!-- Cập nhật Event Detail Container -->
    <div class="event-detail-container hidden" id="eventDetailContainer">
      <button class="nav-btn back-btn detail-back-btn" id="backToEventsBtn">
        <i class="bi bi-arrow-left"></i> Back to list
      </button>
      <div id="eventDetailContent">
        <!-- Event info sẽ được render ở đây -->
        <div id="event_info"></div>

        <!-- Video Container -->
        <div class="container mt-4 bg-white p-0 ps-1 pb-1 pe-1 rounded hidden" id="videos-container">
          <div class="video-wrapper row g-1">
            <!-- Main video player -->
            <div class="video-player col-xl-8 rounded">
              <div class="video-info">
                <h6 id="videoTitle"></h6>
              </div>
              <video autoplay="true" controls muted id="mainVideo">
                <source src="" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>

            <!-- Video list -->
            <div class="video-list col">
              <!-- Video items sẽ được render ở đây -->
            </div>
          </div>
        </div>

        <!-- Photos Container -->
        <div class="justified-gallery" id="photos-container">
          <!-- Images sẽ được render ở đây -->
        </div>
      </div>
    </div>
    <!-- Thêm sau .timeline-header và trước .action-bar -->
    <div class="slideshow-container" id="slideshowContainer">
      <div class="slideshow-wrapper">
        <!-- Thêm vào slideshow-wrapper -->
        <div class="slideshow-controls">
          <button class="slideshow-btn slideshow-prev" id="slideshowPrevBtn"><i class="bi bi-arrow-left"></i></button>
          <button class="slideshow-btn slideshow-next" id="slideshowNextBtn"><i class="bi bi-arrow-right"></i></button>
        </div>
        <div class="slides-track" id="slidesTrack">
          <!-- Slides sẽ được render ở đây -->
        </div>
        <div class="slide-indicators" id="slideIndicators">
          <!-- Indicators sẽ được render ở đây -->
        </div>
      </div>
    </div>
  </div>

  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="/assets/js/utils.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.13/dayjs.min.js"></script>
  <script>
    const currentYear = <?php echo isset($content['year']) && is_numeric($content['year']) ? $content['year'] : 'null'; ?>;
  </script>
  <script src="/pages/event-grid/event-grid.js?v=2.1"></script>
</body>

</html>
```

## File: events-public/css.php
```php
<?php require_once $_SERVER['DOCUMENT_ROOT'] . '/api/core/Helper.php'; ?>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous" />
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css" />
<link href="https://cdn.jsdelivr.net/npm/tom-select@2.4.3/dist/css/tom-select.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/tom-select@2.3.1/dist/css/tom-select.bootstrap5.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.min.css" crossorigin="anonymous">
<style>
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  }


</style>
```

## File: events-public/event-detail.css
```css
/* ===========================================
   EVENT DETAIL PAGE STYLES
   =========================================== */

/* Main Container for Detail Page */
.event-detail-container {
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(158, 239, 225, 0.3);
  box-shadow: var(--shadow-md);
  margin-top: 20px;
  min-height: 80vh;
  position: relative;
}

/* Back button specific to detail page */
.detail-back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
}

#event_info .text-description {
  line-height: 1.8;
  font-size: 1.1rem;
  color: var(--dark-gray);
  text-align: justify;
}


/* ===========================================
   MEDIA COMPONENTS (VIDEO & IMAGE)
   =========================================== */

/* Video Components */
#videos-container {
  margin-top: 30px;
}

.video-wrapper {
  display: flex;
  gap: 1rem;
}

.video-player {
  height: 500px;
  overflow: hidden;
  position: relative;
  background: #000;
  border-radius: var(--radius-md);
}

.video-player video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* Use contain to see the whole video */
  border-radius: var(--radius-md);
}

.video-info {
  padding: 10px 15px;
  color: var(--color-white);
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  z-index: 10;
}

.video-list {
  height: 500px;
  overflow-y: auto;
  padding: 10px;
  background: rgba(245, 245, 245, 0.8);
  border-radius: var(--radius-md);
}

.video-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  border-radius: var(--radius-sm);
  margin-bottom: 10px;
  transition: var(--transition-fast);
  background: var(--color-white);
}

.video-list-item:hover,
.video-list-item.active {
  background-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.video-list-item.active {
  border-left: 4px solid var(--color-secondary);
}

.video-list-item img.thumbnail {
  width: 100px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 2px solid #ccc;
  flex-shrink: 0;
}

.video-list-item h6 {
  color: var(--color-secondary);
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
}

/* Image Gallery */
#photos-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  padding: 20px;
  background: rgba(245, 245, 245, 0.8);
  border-radius: var(--radius-lg);
  margin-top: 30px;
}

#photos-container .picture {
  display: block;
  overflow: hidden;
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
  cursor: pointer;
  position: relative;
  height: 200px;
}

#photos-container .picture:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-lg);
}

#photos-container .picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Image Modal */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(5px);
}

.image-modal.show {
  opacity: 1;
  visibility: visible;
}

.image-modal-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  text-align: center;
}

.image-modal-img {
  max-width: 100%;
  max-height: 80vh;
  /* Give space for title and controls */
  object-fit: contain;
  border-radius: var(--radius-sm);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.image-modal-close {
  position: absolute;
  top: -40px;
  right: -40px;
  background: transparent;
  border: none;
  color: var(--color-white);
  font-size: 40px;
  cursor: pointer;
  transition: var(--transition-fast);
}

.image-modal-close:hover {
  transform: scale(1.2);
  color: var(--color-primary);
}

.image-modal-prev,
.image-modal-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--color-white);
  font-size: 40px;
  font-weight: bold;
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
  z-index: 10001;
}

.image-modal-prev {
  left: -70px;
}

.image-modal-next {
  right: -70px;
}

.image-modal-prev:hover,
.image-modal-next:hover {
  background: rgba(255, 255, 255, 0.3);
}

.image-modal-prev:disabled,
.image-modal-next:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.image-modal-title,
.image-modal-counter {
  color: var(--color-white);
  text-align: center;
  margin-top: 15px;
  font-size: 1rem;
  font-weight: 500;
}

.image-modal-counter {
  font-size: 0.9rem;
  opacity: 0.7;
  margin-top: 5px;
}


/* ===========================================
   LOADING STATES & SKELETONS
   =========================================== */

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite linear;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.video-player-skeleton,
.image-skeleton {
  width: 100%;
  height: 100%;
  min-height: 200px;
  background-color: #e0e0e0;
}

.gallery-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .event-detail-container {
    padding: 20px;
  }

  .detail-back-btn {
    top: 10px;
    left: 10px;
  }

  .video-wrapper {
    flex-direction: column;
  }

  .video-player,
  .video-list {
    height: auto;
    max-height: 300px;
  }

  .image-modal-prev {
    left: 10px;
  }

  .image-modal-next {
    right: 10px;
  }
}

/* Skeleton styles */
.video-player-skeleton,
.video-thumbnail-skeleton,
.video-title-skeleton,
.video-subtitle-skeleton,
.event-image-skeleton,
.event-content-skeleton .skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.video-player-skeleton {
  width: 100%;
  height: 400px;
  position: relative;
}

.video-thumbnail-skeleton {
  width: 80px;
  height: 60px;
  flex-shrink: 0;
}

.video-title-skeleton {
  height: 16px;
  width: 80%;
  margin-bottom: 8px;
}

.video-subtitle-skeleton {
  height: 12px;
  width: 60%;
}

.event-card-skeleton {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
}

.event-image-skeleton {
  width: 200px;
  height: 150px;
  flex-shrink: 0;
}

.event-content-skeleton {
  flex-grow: 1;
}

/* Loading overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Video list item */
.video-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.video-list-item:hover {
  background: #f5f5f5;
}

.video-list-item.active {
  background: #e6f0fa;
  border-left: 4px solid var(--color-secondary);
}

/* Thumbnail */
.thumbnail {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.fade-in-loaded {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}


/* Action Bar Styles */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 2px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-full);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(158, 239, 225, 0.3);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-fast);
  position: relative;
  z-index: 100;
}

/* Sticky behavior when scrolling */
.action-bar.sticky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  box-shadow: var(--shadow-lg);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  animation: slideDown 0.3s ease-out;
}

/* Spacer to prevent content from jumping when action bar becomes sticky */
.action-bar-spacer {
  height: 0;
  transition: var(--transition-fast);
}

.action-bar.sticky+.action-bar-spacer {
  height: 250px;
  /* Height equivalent to sticky action bar */
}

/* Action Controls Group */
.action-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* Image Gallery Skeletons */
.image-skeleton {
  width: 100%;
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.image-skeleton::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23999' viewBox='0 0 24 24'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E");
  background-size: 20px 20px;
  background-repeat: no-repeat;
  background-position: center;
}

/* Gallery Error State */
.gallery-error {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #666;
  background: rgba(255, 0, 0, 0.1);
  border-radius: 10px;
  border: 2px dashed #ff6b6b;
}

/* Event Card Skeleton */
.event-card-skeleton {
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  animation: skeleton-loading 1.5s infinite;
}

.event-image-skeleton {
  width: 100%;
  height: 200px;
  background: linear-gradient(90deg, #e2e8f0 25%, #cbd5e0 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.event-content-skeleton {
  padding: 15px;
}

/* Video Skeletons */
.video-player-skeleton {
  width: 100%;
  height: 300px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8px;
  position: relative;
}

.video-list-item-skeleton {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
  animation: skeleton-loading 1.5s infinite;
}

.video-thumbnail-skeleton {
  width: 80px;
  height: 60px;
  background: linear-gradient(90deg, #e2e8f0 25%, #cbd5e0 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  flex-shrink: 0;
}

.video-info-skeleton {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.video-title-skeleton {
  height: 16px;
  background: linear-gradient(90deg, #e2e8f0 25%, #cbd5e0 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  width: 80%;
}

.video-subtitle-skeleton {
  height: 12px;
  background: linear-gradient(90deg, #e2e8f0 25%, #cbd5e0 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  width: 60%;
}

/* Base Skeleton Class */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

/* Loading Animation */
@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* Fade In Animation khi loaded */
.fade-in-loaded {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading Overlay cho Video Player */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 8px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .image-skeleton {
    height: 150px;
  }

  .video-player-skeleton {
    height: 200px;
  }

  .video-thumbnail-skeleton {
    width: 60px;
    height: 45px;
  }
}

/* Dark Theme Support */
@media (prefers-color-scheme: dark) {

  .skeleton,
  .image-skeleton,
  .event-image-skeleton,
  .video-player-skeleton,
  .video-thumbnail-skeleton,
  .video-title-skeleton,
  .video-subtitle-skeleton {
    background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
    background-size: 200% 100%;
  }

  .event-card-skeleton,
  .video-list-item-skeleton {
    background: #1a1a1a;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {

  .skeleton,
  .image-skeleton {
    background: linear-gradient(90deg, #000 25%, #333 50%, #000 75%);
    background-size: 200% 100%;
  }
}
```

## File: events-public/events.css
```css
.timeline-header {
    text-align: center;
    margin-bottom: 60px;
}

.timeline-title {
    font-family: var(--font-display);
    color: var(--color-secondary);
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 700;
    margin-bottom: 10px;
    text-shadow: 0 0 15px rgba(0, 245, 212, 0.5);
    letter-spacing: 2px;
}

/* Layout */
.timeline-wrapper {
    position: relative;
    padding: 135px 0;
    margin: 30px auto;
    max-width: 1200px;
    /* Nền có hiệu ứng trong suốt và viền neon */
    background: white;
    border-radius: 25px;
    min-height: 280px;
    text-align: center;
    box-shadow: 0 10px 40px rgba(42, 0, 79, 0.5);
}

.timeline {
    position: relative;
    margin: 0;
}

/* === HIỆU ỨNG MỚI: Đường kẻ chuyển động === */
.timeline-line {
    position: absolute;
    left: 100px;
    right: 100px;
    height: 6px;
    top: 50%;
    /* Canh giữa theo chiều dọc */
    transform: translateY(-50%);
    border-radius: 3px;
    /* Gradient chạy */
    background: linear-gradient(90deg, var(--color-secondary), var(--color-primary), var(--color-accent), var(--color-secondary));
    background-size: 200% 100%;
    animation: gradient-flow 5s ease infinite;
}

@keyframes gradient-flow {
    0% {
        background-position: 200% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

.timeline-points {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 120px;
}

/* Navigation */
.timeline-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    z-index: 20;
    padding: 0 20px;
}

/* === HIỆU ỨNG MỚI: Điểm mốc nổi bật hơn === */
.timeline-point {
    position: relative;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.timeline-point:nth-child(odd) {
    transform: translateY(-60px);
}

.timeline-point:nth-child(even) {
    transform: translateY(60px);
}

.point-circle {
    width: 24px;
    height: 24px;
    background: var(--color-secondary);
    border: 5px solid var(--color-primary);
    border-radius: 50%;
    margin: 0 auto;
    transition: var(--transition-slow);
    position: relative;
    z-index: 2;
    box-shadow: 0 0 15px rgba(0, 245, 212, 0.5);
}

.timeline-point:hover .point-circle {
    transform: scale(1.6);
    background: var(--color-primary);
    border-color: var(--color-white);
    /* Hiệu ứng tỏa sáng khi hover */
    box-shadow: var(--shadow-glow);
}

/* Điểm được chọn (active) */
.timeline-point.active .point-circle {
    background: var(--color-primary);
    border-color: var(--color-white);
    transform: scale(1.8);
    box-shadow: var(--shadow-glow);
    animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
    0% {
        transform: scale(1.8);
        box-shadow: var(--shadow-glow);
    }

    50% {
        transform: scale(1.9);
        box-shadow: 0 0 35px var(--color-primary), 0 0 55px var(--color-accent);
    }

    100% {
        transform: scale(1.8);
        box-shadow: var(--shadow-glow);
    }
}

.point-line {
    position: absolute;
    width: 3px;
    background: linear-gradient(to bottom, var(--color-primary), transparent);
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
    border-radius: 2px;
}

.timeline-point:nth-child(odd) .point-line {
    top: 24px;
    height: 50px;
}

.timeline-point:nth-child(even) .point-line {
    bottom: 24px;
    height: 50px;
}

.point-label {
    position: absolute;
    background: var(--color-white);
    padding: 10px 18px;
    border-radius: var(--radius-xl);
    font-size: 14px;
    font-weight: 700;
    color: var(--color-secondary);
    white-space: nowrap;
    backdrop-filter: blur(10px);
    border: 2px solid var(--color-primary);
    box-shadow: var(--shadow-lg);
    transition: var(--transition-base);
    left: 50%;
    transform: translateX(-50%);
}

.timeline-point:nth-child(odd) .point-label {
    bottom: 42px;
}

.timeline-point:nth-child(even) .point-label {
    top: 42px;
}

.timeline-point:hover .point-label {
    background: var(--color-primary);
    color: var(--color-secondary);
    transform: translateX(-50%) translateY(-8px) scale(1.1);
    border-color: var(--color-white);
}

.timeline-point.active .point-label {
    background: var(--color-primary);
    border-color: var(--color-white);
    color: var(--color-secondary);
    font-weight: 800;
    transform: translateX(-50%) scale(1.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .timeline-points {
        padding: 0 60px;
        justify-content: space-between;
    }

    .timeline-line {
        left: 80px;
        right: 80px;
    }

    .point-label {
        font-size: 12px;
        padding: 8px 12px;
    }
}

@media (max-width: 480px) {
    body {
        padding: 1rem;
    }

    .timeline-points {
        padding: 0 20px;
        justify-content: space-between;
    }

    .timeline-line {
        left: 60px;
        right: 60px;
    }

    .timeline-navigation {
        padding: 0 5px;
    }

    .nav-btn {
        width: 45px;
        height: 45px;
        font-size: 18px;
    }

    .point-label {
        display: none;
        /* Ẩn label trên màn hình quá nhỏ để tránh lộn xộn */
    }
}

/* ===========================================
   NAVIGATION BUTTONS & CONTROLS
   =========================================== */

/* Base Button Style */
.nav-btn {
    background: var(--color-white);
    color: var(--color-secondary);
    border: 2px solid var(--color-primary);
    padding: 14px 28px;
    border-radius: var(--radius-full);
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: var(--transition-fast);
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: var(--shadow-sm);
    font-family: inherit;
}

.nav-btn:hover:not(:disabled) {
    background: var(--color-primary);
    color: var(--color-secondary);
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-secondary);
}

.nav-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
}

/* Back Button Variant */
.back-btn {
    background: var(--color-primary);
    color: var(--color-secondary);
    border-color: var(--color-secondary);
    font-weight: 700;
}

.back-btn:hover {
    background: var(--color-white);
    color: var(--color-secondary);
    border-color: var(--color-primary);
}

/* Action Bar Styles */
.action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 2px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: var(--radius-full);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(158, 239, 225, 0.3);
    box-shadow: var(--shadow-sm);
    transition: var(--transition-fast);
    position: relative;
    z-index: 100;
}

/* Sticky behavior when scrolling */
.action-bar.sticky {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    box-shadow: var(--shadow-lg);
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    animation: slideDown 0.3s ease-out;
}

/* Spacer to prevent content from jumping when action bar becomes sticky */
.action-bar-spacer {
    height: 0;
    transition: var(--transition-fast);
}

.action-bar.sticky+.action-bar-spacer {
    height: 250px;
    /* Height equivalent to sticky action bar */
}

/* Action Controls Group */
.action-controls {
    display: flex;
    align-items: center;
    gap: 15px;
}

/* Big Event Filter */
.big-event-filter {
    background: rgba(158, 239, 225, 0.1);
    padding: 10px 15px;
    border-radius: var(--radius-md);
    border: 2px solid var(--color-primary);
}

/* Form Switch/Toggle */
.form-check {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
}

.form-check-input {
    width: 3rem;
    height: 1.5rem;
    margin: 0;
    background-color: var(--color-white);
    border: 2px solid var(--color-primary);
    border-radius: 1rem;
    transition: var(--transition-fast);
    cursor: pointer;
}

.form-check-input:checked {
    background-color: var(--color-primary);
    border-color: var(--color-secondary);
}

.form-check-input:focus {
    border-color: var(--color-secondary);
    outline: 0;
    box-shadow: 0 0 0 0.25rem rgba(158, 239, 225, 0.25);
}

.form-check-label {
    color: var(--color-secondary);
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    margin: 0;
}

/* Special Action Buttons */
.search-btn,
.login-btn {
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 8px;
}

.search-btn img {
    filter: brightness(0) saturate(100%) invert(17%) sepia(100%) saturate(1000%) hue-rotate(192deg);
    transition: var(--transition-fast);
}

.search-btn:hover img {
    filter: brightness(0) saturate(100%) invert(17%) sepia(100%) saturate(1000%) hue-rotate(192deg) brightness(1.2);
}

/* Slideshow Navigation Buttons */
.slideshow-controls {
    position: absolute;
    top: 50%;
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
    pointer-events: none;
    z-index: 10;
}

.slideshow-btn {
    background: rgba(255, 255, 255, 0.8);
    border: 2px solid var(--color-primary);
    color: var(--color-secondary);
    width: 50px;
    height: 50px;
    border-radius: 50%;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    transition: var(--transition-fast);
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: center;
}

.slideshow-btn:hover {
    background: var(--color-primary);
    transform: scale(1.1);
}

/* Pagination Controls */
.pagination-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    margin-top: 30px;
}

.pagination-numbers {
    display: flex;
    align-items: center;
    justify-content: center;
}

#pageInfo {
    background: rgba(255, 255, 255, 0.95);
    padding: 10px 20px;
    border-radius: var(--radius-lg);
    backdrop-filter: blur(10px);
    border: 2px solid var(--color-primary);
    color: var(--color-secondary);
    font-weight: 600;
}

#loadMoreBtn {
    background: var(--color-primary);
    color: var(--color-secondary);
    border: 2px solid var(--color-white);
}

#toggleModeBtn {
    background: var(--color-white);
    color: var(--color-secondary);
    border: 2px solid var(--color-primary);
    font-size: 12px;
    padding: 8px 16px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .nav-btn {
        padding: 12px 24px;
        font-size: 14px;
    }

    .action-bar {
        flex-direction: column;
        gap: 15px;
        padding: 15px;
        margin-bottom: 20px;
    }

    .action-controls {
        flex-direction: column;
        width: 100%;
        gap: 10px;
    }

    .big-event-filter {
        width: 100%;
        text-align: center;
    }

    .search-btn,
    .login-btn {
        width: 100%;
        justify-content: center;
        padding: 12px 20px;
    }
}

@media (max-width: 480px) {
    .nav-btn {
        padding: 10px 20px;
        font-size: 13px;
    }
}

/* Animation for sticky action bar */
@keyframes slideDown {
    from {
        transform: translateY(-100%);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}


/* ===========================================
   EVENTS COMPONENTS & CONTAINERS
   =========================================== */

/* Event Containers */
.events-container,
.event-detail-container {
    padding: 40px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: var(--radius-xl);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(158, 239, 225, 0.3);
    box-shadow: var(--shadow-md);
    margin-top: 20px;
}

.event-detail-container {
    min-height: 60vh;
    position: relative;
}

/* Event Grid Layout */
.events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 25px;
    margin-top: 30px;
}

/* Event Card */
.event-card {
    background: var(--color-white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    transition: var(--transition-slow);
    border: 2px solid transparent;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.event-card::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    z-index: 0;
    background: linear-gradient(90deg, var(--color-primary), var(--color-white));
    transform: scaleX(0);
    transition: var(--transition-fast);
    /* z-index: 1; */
}

.event-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary);
}

.event-card:hover::after {
    transform: scaleX(1);
}

.event-image {
    width: 100%;
    height: 200px;
    overflow: hidden;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    z-index: 1;
}

.event-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: var(--transition-fast);
}

.event-card:hover .event-thumbnail {
    transform: scale(1.05);
}

/* Event Content */
.event-content {
    padding: 25px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    z-index: 1;
}

.event-title {
    color: var(--color-secondary);
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 12px;
    line-height: 1.4;
    min-height: 3.5rem;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.event-date {
    color: var(--medium-gray);
    font-size: 1rem;
    margin-bottom: 15px;
    font-weight: 600;
}

.event-description {
    color: var(--dark-gray);
    line-height: 1.7;
    font-size: 0.95rem;
    flex-grow: 1;
    margin-bottom: 20px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}

.btn-view-detail {
    align-self: flex-start;
    background: var(--color-primary);
    color: var(--color-secondary);
    border: 2px solid var(--color-white);
    padding: 10px 20px;
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    font-weight: 600;
    transition: var(--transition-fast);
    margin-top: auto;
    cursor: pointer;
    font-family: inherit;
}

.btn-view-detail:hover {
    background: var(--color-white);
    color: var(--color-secondary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
    border-color: var(--color-primary);
}

/* Event Tags */
.event-tags {
    position: relative;
    top: -6px;
    display: flex;
    gap: 5px;
    z-index: 5;
}

.event-tag {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    gap: 4px;
    animation: tagFadeIn 0.5s ease-out both;
}

.event-tag.big-event {
    background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
    color: white;
}

.event-tag.has-video {
    background: linear-gradient(135deg, #4ecdc4, #44a08d);
    color: white;
}

.event-tag:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.event-tag:nth-child(1) {
    animation-delay: 0.1s;
}

.event-tag:nth-child(2) {
    animation-delay: 0.2s;
}

@keyframes tagFadeIn {
    from {
        opacity: 0;
        transform: translateX(20px) scale(0.8);
    }

    to {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}

/* Responsive adjustments */
@media (max-width: 1200px) {
    .events-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
    }
}

@media (max-width: 768px) {
    .events-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .event-image {
        height: 150px;
    }

    .event-content {
        padding: 20px;
    }

    .event-title {
        font-size: 1.1rem;
        min-height: auto;
    }
}

@media (max-width: 480px) {

    .events-container,
    .event-detail-container {
        padding: 20px;
    }
}


/* Slideshow Components */
.slideshow-container {
    max-width: 1400px;
    margin: 0 auto 40px auto;
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-xl);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(158, 239, 225, 0.3);
    box-shadow: var(--shadow-md);
}

.slideshow-wrapper {
    position: relative;
    height: 900px;
    overflow: hidden;
}

.slides-track {
    display: flex;
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    height: 100%;
}

.slides-track.no-transition {
    transition: none !important;
}

.slide-item {
    display: flex;
    min-width: 100%;
    height: 100%;
    gap: 20px;
    padding: 20px;
    align-items: center;
    justify-content: center;
}

.slide-image-container {
    width: 45%;
    height: 100%;
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
    cursor: pointer;
    transition: var(--transition-fast);
}

.slide-image-container:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
}

.slide-image {
    height: 100%;
    object-fit: cover;
    border-radius: var(--radius-lg);
    transition: var(--transition-fast);
}

.slide-image-container:hover .slide-image {
    transform: scale(1.05);
}

.slide-indicators {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
}

.slide-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: var(--transition-fast);
    border: 2px solid var(--color-primary);
}

.slide-indicator.active {
    background: var(--color-primary);
    transform: scale(1.2);
}

.slide-indicator:hover {
    background: rgba(158, 239, 225, 0.8);
}

/* Fixed styling for lazy-loaded images */
.picture.fade-in-loaded {
    opacity: 1 !important;
}

.picture img {
    opacity: 1 !important;
    display: block !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {

    .slideshow-wrapper {
        height: 300px;
    }

    .slide-item {
        flex-direction: column;
        gap: 10px;
        padding: 15px;
    }

    .slide-image-container {
        width: 80%;
        height: 45%;
    }
}

@media (max-width: 480px) {
    .slideshow-wrapper {
        height: 250px;
    }

    .slide-image-container {
        width: 90%;
        height: 40%;
    }
}

/* ===========================================
   LOADING STATES & SKELETONS
   =========================================== */

/* Basic Loading State */
.loading {
    text-align: center;
    color: var(--color-secondary);
    font-size: 1.2rem;
    padding: 50px;
    font-weight: 600;
}

/* Spinner */
.spinner {
    border: 4px solid rgba(158, 239, 225, 0.3);
    border-radius: 50%;
    border-top: 4px solid var(--color-primary);
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}


/* Animation for pulse effect */
@keyframes pulse {

    0%,
    100% {
        box-shadow: 0 0 25px rgba(158, 239, 225, 0.6);
    }

    50% {
        box-shadow: 0 0 35px rgba(158, 239, 225, 0.9);
    }
}

/* ===========================================
   ANIMATIONS & TRANSITIONS
   =========================================== */

/* Utility Animation Classes */
.hidden {
    display: none !important;
}

.fade-in {
    animation: fadeIn 0.6s ease-in-out;
}

.slide-up {
    animation: slideUp 0.5s ease-out;
}

.fade-in-loaded {
    animation: fadeInLoaded 0.5s ease-in-out;
}

/* Fade In Animation */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Slide Up Animation */
@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(50px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Fade In Loaded Animation (for images) */
@keyframes fadeInLoaded {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Pulse Animation */
@keyframes pulse {

    0%,
    100% {
        box-shadow: 0 0 25px rgba(158, 239, 225, 0.6);
    }

    50% {
        box-shadow: 0 0 35px rgba(158, 239, 225, 0.9);
    }
}

/* Spin Animation */
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Skeleton Loading Animation */
@keyframes skeleton-loading {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

/* Slide Down Animation (for sticky elements) */
@keyframes slideDown {
    from {
        transform: translateY(-100%);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Tag Fade In Animation */
@keyframes tagFadeIn {
    from {
        opacity: 0;
        transform: translateX(20px) scale(0.8);
    }

    to {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}


/* ===== EVENT CARD SKELETON STYLES ===== */

.event-card-skeleton {
    background: rgba(255, 255, 255, 0.95);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    border: 2px solid transparent;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
    opacity: 0;
    animation: skeletonPulse 1.5s ease-in-out infinite;
}

.event-card-skeleton::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: skeletonShimmer 1.5s infinite linear;
    z-index: 1;
}

.event-card-skeleton .event-image {
    width: 100%;
    height: 200px;
    overflow: hidden;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.event-card-skeleton .event-thumbnail {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeletonLoading 1.5s infinite linear;
}

.event-card-skeleton .event-content {
    padding: 25px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

/* Base skeleton element */
.skeleton {
    background: linear-gradient(135deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeletonLoading 1.5s infinite linear;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
}

.skeleton::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
    animation: skeletonShimmer 2s infinite linear;
}

/* ===== IMAGE LOADING STYLES ===== */

.image-loader {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(245, 245, 245, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(158, 239, 225, 0.3);
    border-radius: 50%;
    border-top: 4px solid var(--color-primary);
    animation: spin 1s linear infinite;
}

/* Enhanced event thumbnail loading */
.event-thumbnail {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.event-thumbnail.loading {
    opacity: 0;
    transform: scale(0.95);
}

.event-thumbnail.fade-in-loaded {
    opacity: 1 !important;
    transform: scale(1);
    animation: imageLoadFadeIn 0.5s ease-out;
}

/* ===== SKELETON ANIMATIONS ===== */


@keyframes spin {
    0% { 
        transform: rotate(0deg); 
    }
    100% { 
        transform: rotate(360deg); 
    }
}



/* ===== ENHANCED EVENT CARD STYLES ===== */

.event-card {
    /* Existing styles... */
    position: relative;
    transition: all 0.3s ease;
}

.event-card .event-image {
    position: relative;
    overflow: hidden;
}

.event-card .event-thumbnail {
    transition: all 0.3s ease;
}

.event-card:hover .event-thumbnail {
    transform: scale(1.05);
}

/* Loading state for event cards */
.event-card.loading {
    pointer-events: none;
    opacity: 0.7;
}

.event-card.loading::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* ===== ERROR STATE STYLES ===== */

.event-thumbnail.error {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-500);
    font-size: 2rem;
}

.event-thumbnail.error::before {
    content: '🖼️';
    opacity: 0.5;
}

/* ===== RESPONSIVE SKELETON STYLES ===== */

@media (max-width: 768px) {
    .event-card-skeleton .event-image {
        height: 150px;
    }
    
    .event-card-skeleton .event-content {
        padding: 20px;
    }
    
    .loading-spinner {
        width: 30px;
        height: 30px;
        border-width: 3px;
    }
}

@media (max-width: 480px) {
    .event-card-skeleton .event-content {
        padding: 15px;
    }
    
    .skeleton {
        border-radius: 3px;
    }
}

/* ===== ADVANCED LOADING STATES ===== */

/* Grid loading animation */
.events-grid.loading .event-card {
    animation: cardSlideUp 0.5s ease-out both;
}

.events-grid.loading .event-card:nth-child(1) { animation-delay: 0.1s; }
.events-grid.loading .event-card:nth-child(2) { animation-delay: 0.2s; }
.events-grid.loading .event-card:nth-child(3) { animation-delay: 0.3s; }
.events-grid.loading .event-card:nth-child(4) { animation-delay: 0.4s; }
.events-grid.loading .event-card:nth-child(5) { animation-delay: 0.5s; }
.events-grid.loading .event-card:nth-child(6) { animation-delay: 0.6s; }

@keyframes cardSlideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Success state after loading */
.event-card.loaded {
    animation: cardLoadSuccess 0.3s ease-out;
}

@keyframes cardLoadSuccess {
    0% {
        transform: scale(0.98);
    }
    50% {
        transform: scale(1.02);
    }
    100% {
        transform: scale(1);
    }
}

/* ===== ACCESSIBILITY IMPROVEMENTS ===== */

@media (prefers-reduced-motion: reduce) {
    .skeleton,
    .skeleton::before,
    .event-card-skeleton::before,
    .loading-spinner {
        animation: none !important;
    }
    
    .event-thumbnail.fade-in-loaded {
        animation: none !important;
        transition: opacity 0.1s ease !important;
    }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
    .skeleton {
        background: linear-gradient(135deg, #d0d0d0 25%, #a0a0a0 50%, #d0d0d0 75%);
    }
    
    .loading-spinner {
        border-color: #000;
        border-top-color: transparent;
    }
}


/* Slideshow Modal Styles */
.slideshow-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  z-index: 10000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.slideshow-modal.show {
  opacity: 1;
  visibility: visible;
}

.slideshow-modal-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.slideshow-modal-content {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

/* Image container với zoom support */
.slideshow-modal-image-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  border-radius: 8px;
  background: #000;
  touch-action: none; /* Quan trọng cho touch support */
}

.slideshow-modal-image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: grab;
  transition: transform 0.3s ease;
  transform-origin: center center;
}

.slideshow-modal-image-wrapper.dragging {
  cursor: grabbing;
  transition: none;
}

.slideshow-modal-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
  pointer-events: none;
}

/* Navigation buttons */
.slideshow-modal-nav {
  position: absolute;
  top: 50%;
  width: 5rem;
  height: 5rem;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 3rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.3s ease;
  z-index: 10001;
  backdrop-filter: blur(10px);
}

.slideshow-modal-prev {
  left: 30px;
}

.slideshow-modal-next {
  right: 30px;
}

.slideshow-modal-nav:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-50%) scale(1.1);
}

/* Close button */
.slideshow-modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 5rem;
  height: 5rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 2rem;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 50%;
  z-index: 10001;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.slideshow-modal-close:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* Image info */
.slideshow-modal-info {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: white;
  z-index: 10001;
}

.slideshow-modal-title {
  font-size: 1.2rem;
  margin-bottom: 5px;
  font-weight: 600;
}

.slideshow-modal-counter {
  font-size: 1rem;
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 768px) {
  .slideshow-modal-nav {
    font-size: 2rem;
    padding: 15px 20px;
  }
  
  .slideshow-modal-prev {
    left: 15px;
  }
  
  .slideshow-modal-next {
    right: 15px;
  }
  
  .slideshow-modal-close {
    top: 15px;
    right: 15px;
    font-size: 1.5rem;
  }
}

.pagination-btn {
    padding: 8px 12px;
    margin: 0 2px;
    border: 1px solid #ddd;
    background: white;
    color: #333;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.pagination-btn:hover:not(.disabled):not(.active) {
    background: #f5f5f5;
    border-color: #999;
}

.pagination-btn.active {
    background: var(--color-primary);
    color: var(--color-secondary);
    border-color: var(--color-primary);
    cursor: default;
}

.pagination-btn.disabled {
    background: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
}

.pagination-ellipsis {
    padding: 8px 4px;
    color: #6c757d;
    user-select: none;
}

/* Container for pagination */
#paginationNumbers {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 30px 0;
}

/* Responsive design */
@media (max-width: 768px) {
    .pagination-bar {
        padding: 10px 15px;
        gap: 3px;
    }
    
    .pagination-btn {
        padding: 6px 10px;
        font-size: 14px;
        min-width: 35px;
        height: 35px;
    }
    
    .all-mode-btn {
        font-size: 14px !important;
        padding: 8px 14px !important;
    }
}

/* Infinite Scroll Loader */
.infinite-scroll-loader {
    opacity: 0;
    animation: fadeInLoader 0.3s ease-in-out forwards;
}

@keyframes fadeInLoader {
    0% { 
        opacity: 0; 
        transform: translateY(10px); 
    }
    100% { 
        opacity: 1; 
        transform: translateY(0); 
    }
}

.infinite-scroll-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--color-primary);
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Pagination Bar Styles */
.pagination-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    flex-wrap: wrap;
    background: rgba(255, 255, 255, 0.9);
    padding: 15px 20px;
    border-radius: 15px;
    box-shadow: 0 4px 20px rgba(42, 0, 79, 0.15);
    border: 1px solid rgba(158, 239, 225, 0.3);
}

/* All Mode Button - Prominent Styling */
.all-mode-btn {
    background: linear-gradient(135deg, var(--color-primary), #7dd3c0) !important;
    color: var(--color-secondary) !important;
    border: 2px solid var(--color-primary) !important;
    font-weight: 700;
    font-size: 16px;
    padding: 10px 18px !important;
    border-radius: 12px !important;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    margin-right: 15px;
    box-shadow: 0 4px 15px rgba(158, 239, 225, 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.all-mode-btn:hover:not(.disabled) {
    background: linear-gradient(135deg, #7dd3c0, var(--color-primary)) !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(158, 239, 225, 0.6);
}

/* Active ALL button - even more prominent */
.all-mode-btn.all-active {
    background: linear-gradient(135deg, #ff6b6b, #ffa500) !important;
    border-color: #ff6b6b !important;
    color: white !important;
    animation: pulseGlow 2s infinite;
    box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
}

.all-mode-btn.all-active:hover {
    background: linear-gradient(135deg, #ffa500, #ff6b6b) !important;
    box-shadow: 0 0 30px rgba(255, 107, 107, 0.7);
}

@keyframes pulseGlow {
    0%, 100% { 
        box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
    }
    50% { 
        box-shadow: 0 0 30px rgba(255, 107, 107, 0.8);
    }
}

/* Regular pagination buttons */
.pagination-btn {
    padding: 8px 12px;
    margin: 0 2px;
    border: 1px solid #ddd;
    background: white;
    color: #333;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
    font-weight: 500;
    min-width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.pagination-btn:hover:not(.disabled):not(.all-mode-btn) {
    background: #f8f9fa;
    border-color: var(--color-primary);
    color: var(--color-secondary);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(158, 239, 225, 0.2);
}

.pagination-btn.active:not(.all-mode-btn) {
    background: var(--color-primary);
    color: var(--color-secondary);
    border-color: var(--color-primary);
    cursor: default;
    font-weight: 600;
}

.pagination-btn.disabled {
    background: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
}

.pagination-ellipsis {
    padding: 8px 4px;
    color: #6c757d;
    user-select: none;
    font-weight: bold;
}

/* Navigation arrows */
.pagination-prev, .pagination-next {
    font-size: 18px;
    font-weight: bold;
}

/* Pagination controls container spacing */
.pagination-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}
```

## File: events-public/family-tree.php
```php
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Family Tree - Lawrence S.Ting School</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Rowdies:wght@300;400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/assets/styles/main.css">

    <style>
       

        /* Animated Background Elements */
        .floating-elements {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 1;
            pointer-events: none;
        }

        .floating-element {
            position: absolute;
            opacity: 0.1;
            animation: float 15s infinite ease-in-out;
        }

        .floating-element:nth-child(1) {
            top: 10%;
            left: 10%;
            font-size: 3rem;
            animation-delay: 0s;
            color: var(--color-secondary);
        }

        .floating-element:nth-child(2) {
            top: 20%;
            right: 15%;
            font-size: 2rem;
            animation-delay: 3s;
            color: var(--color-primary);
        }

        .floating-element:nth-child(3) {
            top: 60%;
            left: 20%;
            font-size: 2.5rem;
            animation-delay: 6s;
            color: var(--color-secondary);
        }

        .floating-element:nth-child(4) {
            top: 70%;
            right: 25%;
            font-size: 1.8rem;
            animation-delay: 9s;
            color: var(--color-primary);
        }

        .floating-element:nth-child(5) {
            top: 40%;
            left: 5%;
            font-size: 2.2rem;
            animation-delay: 12s;
            color: var(--color-secondary);
        }

        /* Main Container */
        .coming-soon-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
            position: relative;
            z-index: 2;
        }

        /* Logo */
        .logo-section {
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 10;
        }

        .logo-img {
            width: 150px;
            height: auto;
            padding: 0.5rem;
            border-radius: 0.5rem;
            animation: logoGlow 3s ease-in-out infinite;
        }

        /* Main Content */
        .content-wrapper {
            text-align: center;
            max-width: 800px;
            margin: 0 auto;
        }

        /* Tree Icon */
        .tree-container {
            margin-bottom: 2rem;
            position: relative;
        }

        .tree-icon {
            font-size: 8rem;
            color: var(--color-secondary);
            display: inline-block;
            animation: treeGrow 2s ease-out;
            filter: drop-shadow(0 10px 20px rgba(27, 70, 100, 0.2));
        }

        .tree-leaves {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: leavesRustle 4s ease-in-out infinite;
        }

        /* Title Section */
        .title-section {
            margin-bottom: 3rem;
        }

        .main-title {
            font-family: 'Rowdies', sans-serif;
            font-size: clamp(2.5rem, 6vw, 4rem);
            color: var(--color-secondary);
            font-weight: 700;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
            animation: titleSlideIn 1.2s ease-out;
        }

        .subtitle {
            font-size: clamp(1.2rem, 3vw, 1.8rem);
            color: var(--color-secondary);
            font-weight: 600;
            margin-bottom: 2rem;
            opacity: 0.8;
            animation: subtitleFadeIn 1.5s ease-out 0.3s both;
        }

        /* Coming Soon Card */
        .coming-soon-card {
            background: rgba(255, 255, 255, 0.95);
            border: 3px solid var(--color-primary);
            border-radius: var(--radius-xl);
            padding: 3rem 2rem;
            margin-bottom: 3rem;
            backdrop-filter: blur(15px);
            box-shadow: var(--shadow-lg);
            animation: cardSlideUp 1.8s ease-out 0.6s both;
            position: relative;
            overflow: hidden;
        }

        .coming-soon-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(158, 239, 225, 0.3), transparent);
            animation: shimmer 3s ease-in-out infinite;
        }

        .coming-soon-title {
            font-family: 'Rowdies', sans-serif;
            font-size: 2.5rem;
            color: var(--color-secondary);
            margin-bottom: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .coming-soon-description {
            font-size: 1.2rem;
            line-height: 1.8;
            color: var(--dark-gray);
            margin-bottom: 2rem;
            position: relative;
            z-index: 2;
        }

        /* Progress Indicator */
        .progress-section {
            margin-bottom: 2rem;
        }

        .progress-label {
            font-weight: 600;
            color: var(--color-secondary);
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }

        .progress-container {
            background: rgba(27, 70, 100, 0.1);
            border-radius: var(--radius-round);
            height: 12px;
            overflow: hidden;
            margin-bottom: 1rem;
        }

        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
            border-radius: var(--radius-round);
            width: 0%;
            animation: progressFill 3s ease-out 2s forwards;
            position: relative;
        }

        .progress-bar::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            animation: progressShine 2s ease-in-out infinite;
        }

        /* Features Preview */
        .features-preview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .feature-item {
            background: rgba(158, 239, 225, 0.1);
            padding: 1.5rem;
            border-radius: var(--border-radius-md);
            border: 2px solid var(--color-primary);
            transition: all var(--transition-fast);
            animation: featureSlideIn 2s ease-out both;
        }

        .feature-item:nth-child(1) {
            animation-delay: 1s;
        }

        .feature-item:nth-child(2) {
            animation-delay: 1.2s;
        }

        .feature-item:nth-child(3) {
            animation-delay: 1.4s;
        }

        .feature-item:hover {
            transform: translateY(-5px);
            background: var(--color-primary);
            box-shadow: var(--shadow-md);
        }

        .feature-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            display: block;
        }

        .feature-title {
            font-weight: 600;
            color: var(--color-secondary);
            font-size: 1rem;
            margin-bottom: 0.5rem;
        }

        .feature-desc {
            font-size: 0.9rem;
            color: var(--medium-gray);
            line-height: 1.4;
        }

        /* Back Button */
        .back-button {
            background: var(--color-white);
            color: var(--color-secondary);
            border: 2px solid var(--color-primary);
            padding: 15px 30px;
            border-radius: var(--radius-lg);
            text-decoration: none;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all var(--transition-fast);
            display: inline-flex;
            align-items: center;
            gap: 10px;
            box-shadow: var(--shadow-sm);
            animation: buttonSlideIn 2.5s ease-out 1.8s both;
        }

        .back-button:hover {
            background: var(--color-primary);
            color: var(--color-secondary);
            transform: translateY(-3px);
            box-shadow: var(--shadow-lg);
            text-decoration: none;
        }

        .back-button::before {
            content: '←';
            transition: transform var(--transition-fast);
        }

        .back-button:hover::before {
            transform: translateX(-5px);
        }

        /* Animations */
        @keyframes float {

            0%,
            100% {
                transform: translateY(0px) rotate(0deg);
            }

            25% {
                transform: translateY(-20px) rotate(5deg);
            }

            50% {
                transform: translateY(-10px) rotate(-3deg);
            }

            75% {
                transform: translateY(-15px) rotate(2deg);
            }
        }

        @keyframes logoGlow {

            0%,
            100% {
                box-shadow: 0 0 20px rgba(158, 239, 225, 0.3);
            }

            50% {
                box-shadow: 0 0 30px rgba(158, 239, 225, 0.6);
            }
        }

        @keyframes treeGrow {
            from {
                transform: scale(0) rotate(-10deg);
                opacity: 0;
            }

            to {
                transform: scale(1) rotate(0deg);
                opacity: 1;
            }
        }

        @keyframes leavesRustle {

            0%,
            100% {
                transform: translate(-50%, -50%) rotate(0deg);
            }

            25% {
                transform: translate(-50%, -50%) rotate(2deg);
            }

            75% {
                transform: translate(-50%, -50%) rotate(-2deg);
            }
        }

        @keyframes titleSlideIn {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes subtitleFadeIn {
            from {
                opacity: 0;
                transform: translateY(30px);
            }

            to {
                opacity: 0.8;
                transform: translateY(0);
            }
        }

        @keyframes cardSlideUp {
            from {
                opacity: 0;
                transform: translateY(50px) scale(0.9);
            }

            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        @keyframes shimmer {
            0% {
                left: -100%;
            }

            100% {
                left: 100%;
            }
        }

        @keyframes progressFill {
            from {
                width: 0%;
            }

            to {
                width: 5%;
            }
        }

        @keyframes progressShine {
            0% {
                transform: translateX(-100%);
            }

            100% {
                transform: translateX(100%);
            }
        }

        @keyframes featureSlideIn {
            from {
                opacity: 0;
                transform: translateY(30px) scale(0.8);
            }

            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        @keyframes buttonSlideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .logo-img {
                width: 120px;
            }

            .tree-icon {
                font-size: 6rem;
            }

            .coming-soon-card {
                padding: 2rem 1.5rem;
                margin: 0 1rem 2rem;
            }

            .coming-soon-title {
                font-size: 2rem;
            }

            .features-preview {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .floating-element {
                font-size: 1.5rem !important;
            }
        }

        @media (max-width: 480px) {
            .coming-soon-container {
                padding: 10px;
            }

            .logo-section {
                top: 10px;
                left: 10px;
            }

            .logo-img {
                width: 100px;
            }

            .tree-icon {
                font-size: 4rem;
            }

            .coming-soon-card {
                padding: 1.5rem 1rem;
            }

            .coming-soon-title {
                font-size: 1.5rem;
                letter-spacing: 1px;
            }

            .back-button {
                padding: 12px 24px;
                font-size: 1rem;
            }
        }
    </style>
</head>

<body>
    <!-- Floating Background Elements -->
    <div class="floating-elements">
        <div class="floating-element">🌿</div>
        <div class="floating-element">📚</div>
        <div class="floating-element">🎓</div>
        <div class="floating-element">🌱</div>
        <div class="floating-element">📖</div>
    </div>

    <!-- Logo -->
    <div class="logo-main">
        <img src="/assets/images/logo.svg" alt="Lawrence S.Ting School">
    </div>

    <!-- Main Content -->
    <div class="coming-soon-container">
        <div class="content-wrapper">
            <!-- Tree Icon -->
            <div class="tree-container">
                <div class="tree-icon"><img height="220" src="\assets\images\icons\tree.png" alt="" srcset=""></div>
                <div class="tree-leaves"></div>
            </div>

            <!-- Title Section -->
            <div class="title-section">
                <h1 class="main-title">Family Tree</h1>

            </div>

            <!-- Coming Soon Card -->
            <div class="coming-soon-card">
                <h2 class="coming-soon-title">Coming Soon</h2>


                <!-- Progress Section -->
                <!-- <div class="progress-section">
                    <div class="progress-label">Development Progress</div>
                    <div class="progress-container">
                        <div class="progress-bar"></div>
                    </div>
                    <small style="color: var(--medium-gray);">0% Complete</small>
                </div> -->

                <!-- Features Preview -->

            </div>

            <!-- Back Button -->
            <a href="/" class="back-button">
                Back to Home
            </a>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Add extra interactivity
            const treeIcon = document.querySelector('.tree-icon');
            const features = document.querySelectorAll('.feature-item');

            // Tree icon click animation
            treeIcon.addEventListener('click', function() {
                this.style.animation = 'none';
                setTimeout(() => {
                    this.style.animation = 'treeGrow 1s ease-out';
                }, 10);
            });

            // Feature items hover effect
            features.forEach(feature => {
                feature.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px) scale(1.02)';
                });

                feature.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });

            // Parallax effect for floating elements
            window.addEventListener('scroll', function() {
                const scrolled = window.pageYOffset;
                const floatingElements = document.querySelectorAll('.floating-element');

                floatingElements.forEach((element, index) => {
                    const speed = (index + 1) * 0.1;
                    element.style.transform = `translateY(${scrolled * speed}px)`;
                });
            });

            // Animate progress bar on scroll
            const observerOptions = {
                threshold: 0.5,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const progressBar = entry.target.querySelector('.progress-bar');
                        if (progressBar) {
                            progressBar.style.animation = 'progressFill 2s ease-out forwards';
                        }
                    }
                });
            }, observerOptions);

            const progressSection = document.querySelector('.progress-section');
            if (progressSection) {
                observer.observe(progressSection);
            }
        });
    </script>
</body>

</html>
```

## File: events-public/home.css
```css
body {
    min-height: auto;
    padding: 0;
}

/* Landing Page Styles */
.landing-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
}

/* Animated background particles */
.landing-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(158, 239, 225, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(27, 70, 100, 0.2) 0%, transparent 50%);
    animation: backgroundFlow 20s ease-in-out infinite;
    z-index: 1;
}

.landing-content {
    text-align: center;
    max-width: 1000px;
    z-index: 2;
    position: relative;
}




.landing-subtitle {
    font-size: clamp(1rem, 3vw, 1.5rem);
    color: var(--color-secondary);
    margin-bottom: 4rem;
    opacity: 0.8;
    animation: subtitleFadeIn 1.2s ease-out 0.3s both;
}

.landing-links {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 3rem;
    max-width: 800px;
    margin: 0 auto;
}

.landing-link {
    display: block;
    padding: 3rem 2rem;
    background: rgba(255, 255, 255, 0.95);
    border: 3px solid var(--color-primary);
    border-radius: 25px;
    text-decoration: none;
    color: var(--color-secondary);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    backdrop-filter: blur(15px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
    animation: linkSlideUp 0.8s ease-out both;
}

.landing-link:nth-child(1) {
    animation-delay: 0.6s;
}

.landing-link:nth-child(2) {
    animation-delay: 0.8s;
}

.landing-link::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(158, 239, 225, 0.3), transparent);
    transition: left 0.6s ease;
}

.landing-link:hover::before {
    left: 100%;
}

.landing-link:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: var(--color-secondary);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    background: var(--color-primary);
}

.landing-link-icon {
    font-size: 5rem;
    margin-bottom: 1.5rem;
    display: block;
    position: relative;
    animation: iconFloat 3s ease-in-out infinite;
}

.landing-link:nth-child(1) .landing-link-icon {
    animation-delay: 0s;
}

.landing-link:nth-child(2) .landing-link-icon {
    animation-delay: 1.5s;
}

/* Special effects for Family Tree icon */
.family-tree-icon {
    position: relative;
}

.family-tree-icon::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120%;
    height: 120%;
    background: radial-gradient(circle, rgba(158, 239, 225, 0.2) 0%, transparent 70%);
    border-radius: 50%;
    animation: castleGlow 4s ease-in-out infinite;
    z-index: -1;
}

/* Special effects for Events icon */
.events-icon {
    position: relative;
}

.events-icon::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 130%;
    height: 130%;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%);
    border-radius: 50%;
    animation: medalGlow 3s ease-in-out infinite;
    z-index: -1;
}

.landing-link-title {
    font-family: 'Rowdies', sans-serif;
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.landing-link-description {
    font-size: 1.1rem;
    line-height: 1.6;
    opacity: 0.8;
    margin-bottom: 1.5rem;
}

.landing-link-arrow {
    font-size: 1.5rem;
    transition: transform 0.3s ease;
    display: inline-block;
}

.landing-link:hover .landing-link-arrow {
    transform: translateX(10px);
}

/* Floating elements in background */
.floating-elements {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;
    pointer-events: none;
}

.floating-element {
    position: absolute;
    opacity: 0.1;
    animation: float 15s infinite ease-in-out;
}

.floating-element:nth-child(1) {
    top: 10%;
    left: 10%;
    font-size: 3rem;
    animation-delay: 0s;
    color: var(--color-secondary);
}

.floating-element:nth-child(2) {
    top: 20%;
    right: 15%;
    font-size: 2rem;
    animation-delay: 3s;
    color: var(--color-primary);
}

.floating-element:nth-child(3) {
    top: 60%;
    left: 20%;
    font-size: 2.5rem;
    animation-delay: 6s;
    color: var(--color-secondary);
}

.floating-element:nth-child(4) {
    top: 70%;
    right: 25%;
    font-size: 1.8rem;
    animation-delay: 9s;
    color: var(--color-primary);
}

/* Animations */
@keyframes backgroundFlow {
    0%, 100% {
        transform: rotate(0deg) scale(1);
    }
    50% {
        transform: rotate(180deg) scale(1.1);
    }
}

@keyframes logoFloat {
    0%, 100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-10px);
    }
}

@keyframes titleSlideIn {
    from {
        opacity: 0;
        transform: translateY(-50px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes subtitleFadeIn {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 0.8;
        transform: translateY(0);
    }
}

@keyframes linkSlideUp {
    from {
        opacity: 0;
        transform: translateY(50px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes iconFloat {
    0%, 100% {
        transform: translateY(0) rotate(0deg);
    }
    33% {
        transform: translateY(-15px) rotate(2deg);
    }
    66% {
        transform: translateY(-5px) rotate(-1deg);
    }
}

@keyframes castleGlow {
    0%, 100% {
        opacity: 0.2;
        transform: translate(-50%, -50%) scale(1);
    }
    50% {
        opacity: 0.4;
        transform: translate(-50%, -50%) scale(1.1);
    }
}

@keyframes medalGlow {
    0%, 100% {
        opacity: 0.2;
        transform: translate(-50%, -50%) scale(1) rotate(0deg);
    }
    50% {
        opacity: 0.4;
        transform: translate(-50%, -50%) scale(1.1) rotate(5deg);
    }
}

@keyframes float {
    0%, 100% {
        transform: translateY(0px) rotate(0deg);
    }
    25% {
        transform: translateY(-20px) rotate(5deg);
    }
    50% {
        transform: translateY(-10px) rotate(-3deg);
    }
    75% {
        transform: translateY(-15px) rotate(2deg);
    }
}

/* Responsive */
@media (max-width: 768px) {
    .landing-links {
        grid-template-columns: 1fr;
        gap: 2rem;
        padding: 0 1rem;
    }
    
    .landing-link {
        padding: 2rem 1.5rem;
        min-width: auto;
    }
    
    .landing-link-icon {
        font-size: 4rem;
    }
    
    .landing-link-title {
        font-size: 1.4rem;
    }

    .logo-main {
        width: 120px;
    }

    .floating-element {
        font-size: 1.5rem !important;
    }
}

@media (max-width: 480px) {
    .landing-container {
        padding: 10px;
    }
    
    .landing-title {
        margin-bottom: 0.5rem;
    }
    
    .landing-subtitle {
        margin-bottom: 2rem;
    }
    
    .landing-link {
        padding: 1.5rem 1rem;
    }

    .logo-main {
        width: 100px;
        top: 10px;
        left: 10px;
    }

    .landing-link-icon {
        font-size: 3rem;
    }
}
```

## File: events-public/home.php
```php
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lawrence S.Ting School - Main Portal</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Rowdies:wght@300;400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/assets/styles/main.css">
    <link rel="stylesheet" href="/assets/styles/pages/home.css">

</head>

<body>
    <!-- Floating Background Elements -->
    <div class="floating-elements">
        <div class="floating-element">📜</div>
        <div class="floating-element">🎓</div>
        <div class="floating-element">🏛️</div>
        <div class="floating-element">⭐</div>

    </div>

    <!-- Logo -->
    <div class="logo-main">
        <img src="/assets/images/logo.svg" alt="Lawrence S.Ting School">
    </div>

    <div class="landing-container">
        <div class="landing-content">
            <h1 class="landing-title">Lawrence S.Ting School</h1>
            <p>&nbsp;</p>

            <div class="landing-links">
                <a href="/events" class="landing-link">
                    <span class="landing-link-icon events-icon"> <img height="180" src="\assets\images\icons\event.png?v=1.2" alt="" srcset=""> </span>
                    <h2 class="landing-link-title">HALL OF HERITAGE
                    </h2>

                    <span class="landing-link-arrow">→</span>
                </a>
                <a href="/family-tree" class="landing-link">
                    <span class="landing-link-icon family-tree-icon"> <img height="180" src="\assets\images\icons\tree.png?v=1.2" alt="" srcset=""></span>
                    <h2 class="landing-link-title">Family Tree</h2>

                    <span class="landing-link-arrow">→</span>
                </a>


            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Enhanced animations and interactions
            const links = document.querySelectorAll('.landing-link');
            const floatingElements = document.querySelectorAll('.floating-element');

            // Add enhanced hover effects
            links.forEach(link => {
                const icon = link.querySelector('.landing-link-icon');

                link.addEventListener('mouseenter', function() {
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                    icon.style.filter = 'drop-shadow(0 10px 20px rgba(27, 70, 100, 0.3))';
                });

                link.addEventListener('mouseleave', function() {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                    icon.style.filter = 'none';
                });

                // Click ripple effect
                link.addEventListener('click', function(e) {
                    const ripple = document.createElement('div');
                    ripple.className = 'ripple';

                    const rect = this.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;

                    ripple.style.cssText = `
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        left: ${x}px;
                        top: ${y}px;
                        background: rgba(255, 255, 255, 0.5);
                        border-radius: 50%;
                        transform: scale(0);
                        animation: ripple 0.6s linear;
                        pointer-events: none;
                        z-index: 1;
                    `;

                    this.appendChild(ripple);

                    setTimeout(() => {
                        ripple.remove();
                    }, 600);
                });
            });

            // Parallax effect for floating elements
            window.addEventListener('scroll', function() {
                const scrolled = window.pageYOffset;

                floatingElements.forEach((element, index) => {
                    const speed = (index + 1) * 0.1;
                    element.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
                });
            });

            // Enhanced icon interactions
            const familyIcon = document.querySelector('.family-tree-icon');
            const eventsIcon = document.querySelector('.events-icon');

            familyIcon.addEventListener('click', function(e) {

                this.style.animation = 'none';
                setTimeout(() => {
                    this.style.animation = 'iconFloat 1s ease-out';
                    e.preventDefault();
                }, 10);

            });

            eventsIcon.addEventListener('click', function(e) {

                this.style.animation = 'none';
                setTimeout(() => {
                    this.style.animation = 'iconFloat 1s ease-out';
                    e.preventDefault();
                }, 10);
            });
        });
    </script>

    <style>
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    </style>
</body>

</html>
```

## File: events-public/js.php
```php
<?php require_once $_SERVER['DOCUMENT_ROOT'] . '/api/core/Helper.php'; ?>

<script src="https://code.jquery.com/jquery-3.6.0.min.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="<?php echo serverName('/assets/plugins/Magnific-Popup-1.2.0/dist/jquery.magnific-popup.min.js') ?>"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
<script type="text/javascript" src="https://cdn.jsdelivr.net/momentjs/latest/moment.min.js"></script>
<script src="/assets/js/utils.js"></script>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jquery-validation@1.19.5/dist/jquery.validate.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.13/dayjs.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/tom-select@2.4.3/dist/js/tom-select.complete.min.js"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
<!-- Flatpickr -->
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/vn.js"></script>
<script>
  class AuthManager {
    constructor() {
      this.permissions = this.getPermissions();
      this.init();
    }

    init() {
      this.bindEvents();
      this.checkPermissions();
    }



    getPermissions() {
      try {
        return JSON.parse(localStorage.getItem('permissions')) || [];
      } catch (error) {
        console.log('Permission parsing error:', error);
        return [];
      }
    }

    hasPermission(permissionString) {
      if (!permissionString) return true;

      const requiredPerms = permissionString.split('|');
      return requiredPerms.some(perm => this.permissions.includes(perm.trim()));
    }

    checkPermissions() {
      document.querySelectorAll('[data-permission]').forEach(el => {
        const required = el.getAttribute('data-permission');
        if (this.hasPermission(required)) {
          el.style.display = '';
        } else {
          el.remove();
        }
      });
    }

    logout() {
      localStorage.clear();
      window.location = '/logout';
    }

    bindEvents() {
      document.addEventListener('click', (e) => {
        const logoutButton = e.target.closest('[data-auth-action="logout"]');
        if (logoutButton) { // Nếu tìm thấy phần tử đó
          LoaderLsts.show();
          e.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ <a>
          this.logout(); // Gọi hàm logout của bạn
        }
      });
    }
  }

  // Auto-initialize
  document.addEventListener('DOMContentLoaded', () => {
    window.AuthManager = new AuthManager();
  });
</script>
```

## File: events-public/login.css
```css
/* ===================================
   ADMIN LOGIN PAGE STYLES
   =================================== */

/* Login Page Layout */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* Background Animation */
.login-page::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: backgroundMove 20s linear infinite;
}

@keyframes backgroundMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* Login Container */
.login-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  position: relative;
  z-index: 1;
}

/* Login Card */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  padding: 3rem 2.5rem;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
      opacity: 0;
      transform: translateY(30px);
  }
  to {
      opacity: 1;
      transform: translateY(0);
  }
}

/* Login Header */
.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.login-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.login-title {
  font-size: 1.75rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #718096;
  font-size: 0.95rem;
}

/* Login Form */
.login-form {
  margin-bottom: 1.5rem;
}

.login-form .form-group {
  margin-bottom: 1.25rem;
}

.login-form .form-label {
  color: #4a5568;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.login-form .form-control {
  background-color: #f7fafc;
  border: 2px solid #e2e8f0;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.login-form .form-control:focus {
  background-color: white;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Input Icons */
.input-group {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 1.1rem;
  pointer-events: none;
  z-index: 1;
}

.input-group .form-control {
  padding-left: 2.75rem;
}

/* Remember Me & Forgot Password */
.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remember-me input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.remember-me label {
  font-size: 0.9rem;
  color: #4a5568;
  cursor: pointer;
  user-select: none;
}

.forgot-password {
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 500;
}

.forgot-password:hover {
  color: #5a67d8;
  text-decoration: underline;
}

/* Login Button */
.login-btn {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s ease;
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.login-btn:active {
  transform: translateY(0);
}

/* Error Messages */
.error-message {
  background-color: #fed7d7;
  color: #c53030;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.error-icon {
  font-size: 1.2rem;
}

/* Success Message */
.success-message {
  background-color: #c6f6d5;
  color: #276749;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Loading State */
.login-btn.loading {
  color: transparent;
}

.login-btn.loading::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  top: 50%;
  left: 50%;
  margin-left: -10px;
  margin-top: -10px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spinner 0.8s linear infinite;
}

@keyframes spinner {
  to { transform: rotate(360deg); }
}

/* Footer */
.login-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.login-footer p {
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.register-link {
  color: #667eea;
  font-weight: 500;
}

.register-link:hover {
  color: #5a67d8;
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-container {
      padding: 10px;
  }
  
  .login-card {
      padding: 2rem 1.5rem;
  }
  
  .login-title {
      font-size: 1.5rem;
  }
  
  .login-logo {
      width: 60px;
      height: 60px;
      font-size: 1.5rem;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .login-page {
      background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }
  
  .login-card {
      background: rgba(45, 55, 72, 0.95);
  }
  
  .login-title {
      color: #e2e8f0;
  }
  
  .login-subtitle {
      color: #a0aec0;
  }
  
  .login-form .form-label {
      color: #cbd5e0;
  }
  
  .login-form .form-control {
      background-color: #2d3748;
      border-color: #4a5568;
      color: #e2e8f0;
  }
  
  .login-form .form-control:focus {
      background-color: #374151;
      border-color: #667eea;
  }
  
  .remember-me label,
  .login-footer p {
      color: #a0aec0;
  }
}
```

## File: events-public/search.php
```php
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <?php require_once $_SERVER['DOCUMENT_ROOT'] . "/pages/css.php" ?>
    <link rel="stylesheet" href="/assets/styles/main.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/2.1.6/css/dataTables.bootstrap5.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/select2-bootstrap-5-theme@1.3.0/dist/select2-bootstrap-5-theme.min.css" />
    <title>LSTS </title>
    <style>
        /* Big Event Filter */
        .big-event-filter {
            background: var(--color-white);
            padding:7px 15px;
            border-radius: var(--radius-md);
            border: 2px solid var(--color-primary);
        }

        /* Form Switch/Toggle */
        .form-check {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 0;
        }

        .form-check-input {
            width: 3rem;
            height: 1.5rem;
            margin: 0;
            background-color: var(--color-white);
            border: 2px solid var(--color-primary);
            border-radius: 1rem;
            transition: var(--transition-fast);
            cursor: pointer;
        }

        .form-check-input:checked {
            background-color: var(--color-primary);
            border-color: var(--color-secondary);
        }

        .form-check-input:focus {
            border-color: var(--color-secondary);
            outline: 0;
            box-shadow: 0 0 0 0.25rem rgba(158, 239, 225, 0.25);
        }

        .form-check-label {
            color: var(--color-secondary);
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            margin: 0;
        }
    </style>
</head>

<body>



    <div class="container-xl mt-5">
        <a href="/events" class="btn btn-primary mb-3 mt-3 fixed-top" style="width:120px; left:1rem">
            <i class="bi bi-arrow-return-left"></i> Back</a>
        <form id="searchForm" class="mb-4">
            <div class="row g-2">
                <div class="col-md-7">
                    <div class="input-group">
                        <span class="input-group-text"> <i class="bi bi-search"></i></span>
                        <input type="text" class="form-control" id="searchInput" placeholder="Search..." aria-label="Search">
                    </div>
                </div>
                <div class="col-md-3">
                    <select class="form-select" id="categoryFilter">

                    </select>
                </div>
                <div class="col-xl-2  form-group">
                    <div class="big-event-filter">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="checkboxBigEvent">
                            <label class="form-check-label" for="checkboxBigEvent">Big Event</label>
                        </div>
                    </div>
                </div>
                <div class="col-xl-6">
                    <div class="row g-1 align-items-center mb-3">
                        <div class="col-md-3">

                            <select class="form-select" id="presetRange">
                                <option value="custom">Custom</option>
                                <option value="last7">Last 7 Days</option>
                                <option value="thisMonth">This Month</option>
                                <option value="lastMonth">Last Month</option>
                                <option value="thisYear">This Year</option>
                                <option value="lastYear">Last Year</option>
                            </select>
                        </div>
                        -
                        <div class="col-md-3">

                            <input type="text" class="form-control" id="startDateInput" placeholder="YYYY-MM-DD" readonly />
                        </div>
                        -
                        <div class="col-md-3">

                            <input type="text" class="form-control" id="endDateInput" placeholder="YYYY-MM-DD" readonly />
                        </div>
                        <div class="col-xl-1">
                            <button class="btn btn-secondary" id="clearBtn">Clear</button>

                        </div>
                    </div>
                </div>


            </div>
        </form>

        <table class="table table-hover table-bordered bg-white" id="table_events">
            <thead>
                <tr class="bg-secondary text-white">

                    <th class="text-center">Name </th>
                    <th class="text-center">Date</th>
                    <th class="text-center">Category</th>

                    <th class="text-center"></th>

                </tr>
            </thead>

        </table>


    </div>

    <?php
    require_once $_SERVER['DOCUMENT_ROOT'] . "/pages/js.php";
    ?>


    <footer style="min-height: 40vh;"></footer>
    <script src="https://cdn.datatables.net/2.1.6/js/dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/2.1.6/js/dataTables.bootstrap5.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js"></script>
    <script>
        const minLimit = moment().subtract(20, 'year');
        const maxLimit = moment().add(10, 'year');
        let startDate = moment().subtract(7, 'days');
        let endDate = moment();

        function applyPicker(inputSelector, options, callback) {
            $(inputSelector).daterangepicker({
                singleDatePicker: true,
                autoApply: true,
                showDropdowns: true,
                minDate: options.minDate,
                maxDate: options.maxDate,
                startDate: options.startDate,
                locale: {
                    format: 'YYYY-MM-DD'
                },
                autoUpdateInput: false
            }, function(date) {
                $(inputSelector).val(date.format('YYYY-MM-DD'));
                if (callback) callback(date);
            });
        }

        applyPicker('#startDateInput', {
            minDate: minLimit,
            maxDate: endDate,
            startDate: startDate
        }, function(newStart) {
            startDate = newStart;
            $('#endDateInput').data('daterangepicker').minDate = newStart;
            setTimeout(function() {
                table.ajax.reload();

            }, 300);

        });

        applyPicker('#endDateInput', {
            minDate: startDate,
            maxDate: maxLimit,
            startDate: endDate
        }, function(newEnd) {
            endDate = newEnd;
            $('#startDateInput').data('daterangepicker').maxDate = newEnd;
            setTimeout(function() {
                table.ajax.reload();

            }, 300);

        });
        $('#presetRange').on('change', function() {
            const val = $(this).val();


            switch (val) {
                case 'today':
                    startDate = endDate = moment();
                    break;
                case 'yesterday':
                    startDate = endDate = moment().subtract(1, 'days');
                    break;
                case 'last7':
                    startDate = moment().subtract(6, 'days');
                    endDate = moment();
                    break;
                case 'thisMonth':
                    startDate = moment().startOf('month');
                    endDate = moment().endOf('month');
                    break;
                case 'lastMonth':
                    startDate = moment().subtract(1, 'month').startOf('month');
                    endDate = moment().subtract(1, 'month').endOf('month');
                    break;
                case 'thisYear':
                    startDate = moment().startOf('year');
                    endDate = moment().endOf('year');
                    break;
                case 'lastYear':
                    startDate = moment().subtract(1, 'year').startOf('year');
                    endDate = moment().subtract(1, 'year').endOf('year');
                    break;
                default:
                    return;
            }

            $('#startDateInput').val(startDate.format('YYYY-MM-DD'));
            $('#endDateInput').val(endDate.format('YYYY-MM-DD'));

            $('#startDateInput').data('daterangepicker').setStartDate(startDate);
            $('#startDateInput').data('daterangepicker').setEndDate(startDate);
            $('#startDateInput').data('daterangepicker').maxDate = endDate;

            $('#endDateInput').data('daterangepicker').setStartDate(endDate);
            $('#endDateInput').data('daterangepicker').setEndDate(endDate);
            $('#endDateInput').data('daterangepicker').minDate = startDate;
            table.ajax.reload();
        });

        $('#clearBtn').on('click', function() {
            $('#startDateInput').val('');
            $('#endDateInput').val('');
            $('#presetRange').val('custom');

            const defaultStart = moment().subtract(7, 'days');
            const defaultEnd = moment();

            $('#startDateInput').data('daterangepicker').setStartDate(defaultStart);
            $('#startDateInput').data('daterangepicker').setEndDate(defaultStart);
            $('#startDateInput').data('daterangepicker').maxDate = defaultEnd;

            $('#endDateInput').data('daterangepicker').setStartDate(defaultEnd);
            $('#endDateInput').data('daterangepicker').setEndDate(defaultEnd);
            $('#endDateInput').data('daterangepicker').minDate = defaultStart;
        });

        $('#categoryFilter').change(function() {
            table.ajax.reload();
        });

        $('#checkboxBigEvent').change(function() {
            table.ajax.reload();
        });
        var searchDebounce = debounce(function() {
            table.ajax.reload();
        }, 300);

        $('#searchInput').on("input", function() {
            searchDebounce();
        });

        const categoryFilter = SelectAjax({
            selector: "#categoryFilter",
            api: Http().getApiHost("/categories/getAll"),
            optionFormat: function(data) {
                return {
                    text: data.category_name,
                    id: data.category_id
                }
            },
            responseFormat: function(res) {
                return res.data;
            }
        });

        categoryFilter.first({
            text: '-- All Category --',
            id: ''
        })
        categoryFilter.get();


        function getAll(callback = function() {
            LoaderLsts.hide();
        }) {

            return $("#table_events").DataTable({
                processing: true,
                serverSide: true,

                select: true,
                searching: false,
                responsive: true,
                ajax: {
                    url: Http().getApiHost("/events/getAll"),
                    data: function(data) {



                        data.category_id = $("#categoryFilter").val();
                        data.is_big_event = $("#checkboxBigEvent").is(":checked") ? 1 : 0;
                        data.search = $("#searchInput").val();

                        if ($('#startDateInput').val()) {
                            var date = $('#startDateInput').data('daterangepicker');
                            console.log(date.startDate.format('YYYY-MM-DD'));
                            data.start_date = moment(date.startDate).isValid() && $('#startDateInput').val() ? date.startDate.format('YYYY-MM-DD') : "";
                        }
                        if ($('#endDateInput').val()) {
                            var date = $('#endDateInput').data('daterangepicker');
                            console.log(date.startDate.format('YYYY-MM-DD'));
                            data.end_date = moment(date.startDate).isValid() && $('#endDateInput').val() ? date.startDate.format('YYYY-MM-DD') : "";

                        }


                    },
                },
                lengthMenu: [
                    [10, 25, 100, 500, -1],
                    [10, 25, 100, 500, "All"],
                ],
                order: [
                    [0, "desc"]
                ],
                columns: [{
                        data: "event_date",
                        name: "event_date",
                        className: " align-middle",
                        render: function(data, meta, row) {
                            return dayjs(data).format('DD/MM/YYYY')
                        }


                    },
                    {
                        data: "event_name",
                        className: "text-left align-middle min-200",
                        render: function(data, meta, row) {
                            const isBigEvent = row.is_big_event == 1;
                            const hasVideo = row.media?.some(m => this.checkFileType(m.file_path) === 'video');
                            const tagsHTML = generateEventTags(isBigEvent, hasVideo);
                            return row.event_name + tagsHTML;
                        }

                    },

                    {
                        data: "category_id",
                        name: "category_id",
                        render: function(data, meta, row) {
                            return row.category_name;
                        }
                    },




                    {
                        data: null,
                        className: "text-center",
                        render: function(data, meta, row) {
                            return (

                                `<a target="_blank"   href="${Http().getHost("/events/"+ dayjs(row.event_date).format('YYYY') + "/" + row.id) }" 
                                class="btn btn-primary btn_inventory_delete btn-icon"  > View </a>`
                            );
                        },
                    },
                ],
                drawCallback: function() {

                },
            });
        }

        var table = getAll();

        function eventHasVideo(event) {
            if (!event.media || !Array.isArray(event.media)) {
                return false;
            }

            return event.media.some(media => {
                const fileType = this.checkFileType(media.file_path);
                return fileType === 'video';
            });
        }
        $.fn.select2.defaults.set("theme", "bootstrap-5");
        // Method tạo HTML cho tags
        function generateEventTags(isBigEvent, hasVideo) {
            if (!isBigEvent && !hasVideo) {
                return '';
            }

            let tagsHTML = '<div class="">';

            if (isBigEvent) {
                tagsHTML += `
              <div class="badge border border-warning text-warning">
                  <span>⭐</span>
                  <span>Big Event</span>
              </div>
          `;
            }

            if (hasVideo) {
                tagsHTML += `
              <div class="badge bg-info">
                  <span>🎥</span>
                  <span> Video</span>
              </div>
          `;
            }

            tagsHTML += '</div>';
            return tagsHTML;
        }

        function checkFileType(filePath) {
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
            const videoExtensions = ['mp4', 'mkv', 'mov', 'avi', 'flv', 'wmv', 'webm'];
            const extension = filePath.split('.').pop().toLowerCase();

            if (imageExtensions.includes(extension)) return 'image';
            if (videoExtensions.includes(extension)) return 'video';
            return 'unknown';
        }
    </script>
</body>

</html>
```
