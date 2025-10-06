// Content script for Tab Exporter
// 필요한 경우 페이지별 추가 기능을 여기에 구현할 수 있습니다.

console.log('Tab Exporter content script loaded');

// 예시: 페이지의 메타 정보 수집 (필요시 사용)
function getPageMeta() {
    const meta = {
        title: document.title,
        url: window.location.href,
        description: '',
        keywords: ''
    };
    
    // 메타 태그에서 설명 추출
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
        meta.description = descMeta.content;
    }
    
    // 메타 태그에서 키워드 추출
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta) {
        meta.keywords = keywordsMeta.content;
    }
    
    return meta;
}

// 메시지 리스너 (향후 확장용)
chrome.runtime.onMessage?.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageMeta') {
        sendResponse(getPageMeta());
    }
});
