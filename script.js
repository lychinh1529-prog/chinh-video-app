  if (downloadBtn) {
    downloadBtn.addEventListener("click", async () => {
      const urlValue = videoUrl ? videoUrl.value.trim() : "";
      if (!urlValue) {
        showStatus("Vui lòng dán liên kết video cần tải!", "error");
        return;
      }

      downloadBtn.disabled = true;
      showStatus("Đang kết nối API để trích xuất video...", "info");

      try {
        const response = await fetch("https://gendownload.com/api/extract", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ url: urlValue })
        });

        if (!response.ok) {
          throw new Error(`Lỗi kết nối API (${response.status})`);
        }

        const data = await response.json();

        // Kiểm tra dữ liệu phản hồi từ GenDownload API
        if (data && (data.formats || data.url || data.link)) {
          showStatus("Trích xuất thành công! Đang mở liên kết tải...", "success");
          
          // Lấy đường dẫn tải trực tiếp từ kết quả API trả về
          const downloadLink = data.url || data.link || (data.formats && data.formats[0]?.url);
          
          if (downloadLink) {
            setTimeout(() => {
              window.open(downloadLink, "_blank");
            }, 800);
          } else {
            showStatus("Không tìm thấy link tải trực tiếp trong dữ liệu API.", "error");
          }
        } else {
          throw new Error("Không thể lấy dữ liệu video từ liên kết này.");
        }
      } catch (error) {
        console.error(error);
        showStatus(`Lỗi: ${error.message || "Không thể xử lý yêu cầu."}`, "error");
      } finally {
        downloadBtn.disabled = false;
      }
    });
  }
