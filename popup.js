document.addEventListener('DOMContentLoaded', function() {
    const exportAllTabsBtn = document.getElementById('exportAllTabs');
    const exportCurrentWindowBtn = document.getElementById('exportCurrentWindow');
    const copyBtn = document.getElementById('copyBtn');
    const output = document.getElementById('output');
    const status = document.getElementById('status');
    
    let currentMarkdown = '';
    
    // 모든 탭 내보내기
    exportAllTabsBtn.addEventListener('click', function() {
        exportTabs(false);
    });
    
    // 현재 창 탭만 내보내기
    exportCurrentWindowBtn.addEventListener('click', function() {
        exportTabs(true);
    });
    
    // 클립보드에 복사
    copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(currentMarkdown).then(function() {
            showStatus('클립보드에 복사되었습니다!', 'success');
        }, function(err) {
            showStatus('복사 실패: ' + err, 'error');
        });
    });
    
    function exportTabs(currentWindowOnly) {
        const queryOptions = currentWindowOnly ? { currentWindow: true } : {};
        
        chrome.tabs.query(queryOptions, function(tabs) {
            if (chrome.runtime.lastError) {
                showStatus('오류: ' + chrome.runtime.lastError.message, 'error');
                return;
            }
            
            let markdown = '';
            let groupedTabs = {};
            
            // 탭을 도메인별로 그룹화
            tabs.forEach(tab => {
                try {
                    const url = new URL(tab.url);
                    const domain = url.hostname;
                    
                    if (!groupedTabs[domain]) {
                        groupedTabs[domain] = [];
                    }
                    
                    groupedTabs[domain].push({
                        title: tab.title || 'Untitled',
                        url: tab.url
                    });
                } catch (e) {
                    // URL 파싱 실패시 기본 그룹에 추가
                    if (!groupedTabs['기타']) {
                        groupedTabs['기타'] = [];
                    }
                    groupedTabs['기타'].push({
                        title: tab.title || 'Untitled',
                        url: tab.url
                    });
                }
            });
            
            // MediaWiki 포맷 생성
            markdown += `= 탭 목록 (${new Date().toLocaleString()}) =\n\n`;
            markdown += `총 ${tabs.length}개의 탭\n\n`;
            
            // 도메인별로 정렬하여 출력
            Object.keys(groupedTabs).sort().forEach(domain => {
                markdown += `== ${domain} ==\n\n`;
                groupedTabs[domain].forEach(tab => {
                    // 제목에서 [ ] 를 ( ) 로 변환
                    const escapedTitle = tab.title
                        .replace(/\[/g, '(')
                        .replace(/\]/g, ')');
                    
                    markdown += `* [${tab.url} ${escapedTitle}]\n`;
                });
                markdown += '\n';
            });
            
            currentMarkdown = markdown;
            output.textContent = markdown;
            output.style.display = 'block';
            copyBtn.style.display = 'block';
            
            showStatus(`${tabs.length}개의 탭을 내보냈습니다.`, 'success');
        });
    }
    
    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
        setTimeout(() => {
            status.textContent = '';
            status.className = 'status';
        }, 3000);
    }
});
