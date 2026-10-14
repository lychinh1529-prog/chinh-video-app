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
        // Gửi dạng URLSearchParams (form-urlencoded) để tránh lỗi 422
        const formData = new URLSearchParams();
        formData.append("url", urlValue);

        const response = await fetch("https://gendownload.com/api/extract", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
          },
          body: formData.toString()
        });

        if (!response.ok) {
          throw new Error(`Lỗi kết nối API (${response.status})`);
        }

        const data = await response.json();

        if (data && (data.formats || data.url || data.link)) {
          showStatus("Phân tích thành công!", "success");

          // Tạo khung chứa thông tin video & danh sách chất lượng nếu chưa có
          let resultBox = document.getElementById("vdResultBox");
          if (!resultBox) {
            resultBox = document.createElement("div");
            resultBox.id = "vdResultBox";
            resultBox.className = "card";
            resultBox.style.marginTop = "15px";
            downloadBtn.parentNode.insertBefore(resultBox, downloadBtn.nextSibling);
          }

          let currentFormatsData = data.formats || [{ quality: "Mặc định", url: data.url || data.link }];
          
          let formatsOptionsHTML = "";
          currentFormatsData.forEach((fmt, index) => {
            let label = fmt.quality || fmt.resolution || fmt.label || `Định dạng ${index + 1}`;
            let ext = fmt.ext ? ` (${fmt.ext.toUpperCase()})` : "";
            formatsOptionsHTML += `<option value="${index}">${label}${ext}</option>`;
          });

          // Đổ dữ liệu vào khung giao diện
          resultBox.innerHTML = `
            <div style="text-align: center; margin-bottom: 12px;">
              ${data.thumbnail ? `<img src="${data.thumbnail}" alt="Thumbnail" style="max-width: 100%; max-height: 180px; border-radius: 10px; object-fit: cover;">` : ""}
              <h4 style="margin: 10px 0 5px; font-size: 15px; color: #182235; overflow-wrap: anywhere;">${data.title || "Video đã phân tích"}</h4>
              ${data.duration ? `<p style="margin: 0; font-size: 12px; color: #64748b;">Thời lượng: ${data.duration}</p>` : ""}
            </div>

            <div style="margin-bottom: 12px;">
              <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #333;">Chọn chất lượng/định dạng:</label>
              <select id="selectFormatQuality" style="width: 100%; padding: 10px; border: 1px solid #d5deec; border-radius: 8px; background: #fff; font-size: 14px;">
                ${formatsOptionsHTML}
              </select>
            </div>

            <button type="button" id="confirmDownloadBtn" class="btn btn-primary full-width" style="width: 100%; padding: 12px; background: #16a34a; border: none; color: #fff; border-radius: 10px; font-weight: bold; cursor: pointer;">
              ↓ Tải xuống video này
            </button>
          `;

          // Gắn sự kiện bấm nút tải xuống theo định dạng đã chọn trong danh sách
          document.getElementById("confirmDownloadBtn").addEventListener("click", () => {
            const selectedIdx = document.getElementById("selectFormatQuality").value;
            const chosenFormat = currentFormatsData[selectedIdx];
            const downloadLink = chosenFormat ? (chosenFormat.url || chosenFormat.link) : (data.url || data.link);
            
            if (downloadLink) {
              window.open(downloadLink, "_blank");
            } else {
              alert("Không tìm thấy đường dẫn tải cho định dạng này.");
            }
          });

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
