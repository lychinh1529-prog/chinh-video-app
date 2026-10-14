  if (downloadBtn) {
    downloadBtn.addEventListener("click", async () => {
      const urlValue = videoUrl ? videoUrl.value.trim() : "";
      if (!urlValue) {
        showStatus("Vui lòng dán liên kết video cần tải!", "error");
        return;
      }

      downloadBtn.disabled = true;
      showStatus("Đang phân tích video từ hệ thống...", "info");
      if (videoContainer) videoContainer.style.display = "none";

      try {
        // Sử dụng CORS Proxy để vượt qua tường lửa bảo mật (chặn 415/CORS)
        const targetApiUrl = "https://gendownload.com/api/extract";
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetApiUrl)}`;

        const response = await fetch(proxyUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ url: urlValue })
        });

        if (!response.ok) {
          throw new Error(`Lỗi kết nối API (${response.status})`);
        }

        const data = await response.json();
        const videoStreamUrl = data.url || data.link || (data.formats && data.formats[0]?.url);

        if (data && videoStreamUrl) {
          showStatus("Phân tích thành công! Video đã sẵn sàng bên dưới.", "success");

          if (videoContainer) {
            if (videoTitle) videoTitle.textContent = data.title || "Video đã trích xuất thành công";
            
            if (resultVideoPlayer) {
              resultVideoPlayer.src = videoStreamUrl;
              resultVideoPlayer.load();
            }

            if (directDownloadLink) {
              directDownloadLink.href = videoStreamUrl;
            }

            videoContainer.style.display = "block";
            videoContainer.scrollIntoView({ behavior: "smooth" });
          }
        } else {
          throw new Error("Không thể trích xuất video từ liên kết này.");
        }
      } catch (error) {
        console.error(error);
        showStatus(`Lỗi: ${error.message || "Link không được hỗ trợ hoặc không thể xử lý."}`, "error");
      } finally {
        downloadBtn.disabled = false;
      }
    });
  }
