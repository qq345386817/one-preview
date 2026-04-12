const translations = {
  en: {
    title: "OnePreview FAQ",
    view_faq: "View FAQ",
    intro_subtitle: "All-in-one preview enhancement for the Apple ecosystem.",
    privacy_title: "Privacy Policy",
    back_home: "Back to Home",
    p_intro: "OnePreview respects your privacy. This policy explains our practices regarding your data.",
    p_h1: "1. Information Collection",
    p_p1: "OnePreview does not collect any personal information. We do not require account registration, nor do we track your usage, keystrokes, or any data unrelated to the preview service.",
    p_h2: "2. Data Storage",
    p_p2: "All your settings and preferences are stored locally on your device. We do not upload your files or metadata to any servers.",
    p_h3: "3. Sandbox Security",
    p_p3: "The app operates within Apple's strict sandbox environment. It only accesses files you explicitly choose to preview using the system Quick Look mechanism.",
    p_h4: "4. Third Parties",
    p_p4: "We do not share your data with third parties because we do not collect any data in the first place.",
    p_h5: "5. Contact",
    p_p5: "If you have questions, please contact us at cameoshell09@gmail.com.",
    q1: 'What is OnePreview?',
    a1: 'OnePreview is a powerful Quick Look enhancement tool for the Apple ecosystem. It allows you to instantly preview files that are not natively supported (like Markdown, Swift, JSON, CSV) simply by pressing the spacebar, without opening any dedicated app.',
    q2: 'How to use OnePreview on macOS?',
    a2_1: '1. Open the "OnePreview" app once to register the extension with macOS.',
    a2_2: '2. In Finder, select a supported file (e.g., a `.md` or `.swift` file) and simply press the <b>Spacebar</b> to see the rich preview.',
    q3: 'How to use OnePreview on iOS or iPadOS?',
    a3_1: '1. Make sure "OnePreview" is installed on your device.',
    a3_2: '2. Open the system "Files" app, long-press on a file, and select "Quick Look" (or just tap the file) to view the beautifully rendered content.',
    q4: 'Do I need to keep the OnePreview app open?',
    a4: 'No. After you launch the app for the first time on macOS (which is required to register the extension), you can close it. The preview extension operates seamlessly in the background.',
    q5: 'What file formats are supported?',
    a5_1: '• <b>Markdown:</b> Beautifully rendered HTML and source syntax highlighting.',
    a5_2: '• <b>Source Code:</b> Swift, Python, JS, C++, Shell, etc.',
    a5_3: '• <b>Structured Data:</b> JSON, YAML, XML with syntax colors, and CSV/TSV rendered as neat tables.',
    a5_4: '• <b>Folders:</b> Preview the contents inside a directory, including file sizes and modification dates.',
    q6: 'Why doesn\'t the preview update immediately after I edit a Markdown file?',
    a6: 'macOS Quick Look occasionally caches previews. You can close the preview window (press Spacebar again) and reopen it to force a refresh.',
    q7: 'My Markdown images aren\'t loading, why?',
    a7: 'Due to Apple\'s strict sandbox security policies, extensions sometimes face restrictions reading local files referenced inside documents. We employ techniques to bypass this for adjacent files when possible, but remote web URLs (`https://...`) are generally the most reliable for images.',
    q8: 'Why doesn\'t OnePreview work for files in the Trash?',
    a8: 'macOS has strict system-level security restrictions for the Trash directory. Third-party Quick Look extensions are entirely blocked by the operating system from accessing files located in the Trash. You must move the file out of the Trash to preview it.',
    footer: 'Have questions or need support? Contact us at cameoshell09@gmail.com'
  },
  "zh-CN": {
    title: "OnePreview 常见问题",
    view_faq: "查看 FAQ",
    intro_subtitle: "适配 Apple 生态的全能型预览增强工具。",
    privacy_title: "隐私政策",
    back_home: "返回首页",
    p_intro: "OnePreview 非常重视您的隐私。本政策说明了我们处理您数据的方式。",
    p_h1: "1. 信息收集",
    p_p1: "OnePreview 不收集任何个人信息。我们不需要账户注册，也不会跟踪您的使用习惯、按键记录或任何与预览服务无关的数据。",
    p_h2: "2. 数据存储",
    p_p2: "您的所有设置和偏好都存储在您的本地设备上。我们不会将您的文件或元数据上传到任何服务器。",
    p_h3: "3. 沙盒安全",
    p_p3: "该应用在 Apple 严格的沙盒环境中运行。它仅访问您明确选择使用系统快速查看机制进行预览的文件。",
    p_h4: "4. 第三方共享",
    p_p4: "我们不会与第三方分享您的数据，因为我们根本不收集任何数据。",
    p_h5: "5. 联系我们",
    p_p5: "如有任何疑问，请联系 cameoshell09@gmail.com。",
    q1: '什么是 OnePreview？',
    a1: 'OnePreview 是一款全能型 Apple 生态多平台预览增强工具。它扩展了系统原生的“空格预览”能力，让您在不打开专门编辑软件的情况下，快速预览原生不支持的文件格式（如 Markdown 渲染、Swift/JSON 代码高亮等）。',
    q2: '如何在 macOS 上使用 OnePreview？',
    a2_1: '1. 首次使用请务必打开一次主应用 “OnePreview” ，以便向 macOS 系统注册预览扩展。',
    a2_2: '2. 注册成功后，在访达 (Finder) 中选中支持的文件（如 `.md` 文件），直接按下<b>空格键</b>即可获得丰富的预览。',
    q3: '如何在 iOS / iPadOS 上使用？',
    a3_1: '1. 确保您的设备上已经安装了 “OnePreview” App。',
    a3_2: '2. 打开系统自带的 “文件” App，长按需要预览的文件，选择“快速查看”（或直接点击文件），即可享受精美的渲染效果。',
    q4: '我需要一直保持 OnePreview App 打开吗？',
    a4: '不需要。在 Mac 上首次运行主程序注册扩展后，您就可以随时关闭它。快速查看扩展会在后台根据系统调度自动生效。',
    q5: '目前支持哪些文件格式？',
    a5_1: '• <b>Markdown:</b> 精美的 HTML 样式渲染，并带有源码语法高亮。',
    a5_2: '• <b>源代码:</b> Swift, Python, JS, C++, Shell 等主流编程语言的高亮。',
    a5_3: '• <b>结构化数据:</b> JSON, YAML, XML 颜色高亮，以及将 CSV/TSV 渲染为整洁的表格。',
    a5_4: '• <b>文件夹:</b> 直接预览一个文件夹内部的结构，包括文件大小和修改日期。',
    q6: '为什么我修改了 Markdown 文件后，预览内容没有立刻更新？',
    a6: 'macOS 的 Quick Look 机制偶尔会进行底层缓存。您可以先关闭当前预览窗口（再次按下空格），然后重新按下空格键触发刷新。',
    q7: '为什么 Markdown 里的图片加载不出来？',
    a7: '受限于 Apple 严苛的沙盒安全策略，预览扩展在读取文档内部引用的其他本地文件时会受到限制。我们采用了相应技术尽可能绕过同级目录文件的读取限制，但在大多数情况下，使用网络链接 (`https://...`) 作为图片地址是更为可靠的选择。',
    q8: '为什么不支持预览废纸篓（垃圾桶）里的文件？',
    a8: 'macOS 具有极严苛的底层安全限制（系统完整性保护），它会彻底在系统级屏蔽所有第三方 Quick Look 扩展读取废纸篓内的文件。这是 Apple 的安全机制决定的，您必须将文件移出废纸篓后才能正常使用空格预览。',
    footer: '有任何疑问或需要反馈 Bug？请联系我们：cameoshell09@gmail.com'
  },
  "zh-TW": {
    title: "OnePreview 常見問題",
    view_faq: "查看 FAQ",
    intro_subtitle: "適配 Apple 生态的全能型預覽增強工具。",
    privacy_title: "隱私政策",
    back_home: "返回首頁",
    p_intro: "OnePreview 非常重視您的隱私。本政策說明了我們處理您數據的方式。",
    p_h1: "1. 信息收集",
    p_p1: "OnePreview 不收集任何個人信息。我們不需要帳戶註冊，也不會跟蹤您的使用習慣、按鍵記錄或任何與預覽服務無關的數據。",
    p_h2: "2. 數據存儲",
    p_p2: "您的所有設置和偏好都存儲在您的本地設備上。我們不會將您的文件或元數據上傳到任何服務器。",
    p_h3: "3. 沙盒安全",
    p_p3: "該應用在 Apple 嚴格的沙盒環境中運行。它僅訪問您明確選擇使用系統快速查看機制進行預覽的文件。",
    p_h4: "4. 第三方共享",
    p_p4: "我們不會與第三方分享您的數據，因為我們根本不收集任何數據。",
    p_h5: "5. 聯繫我們",
    p_p5: "如有任何疑問，請聯繫 cameoshell09@gmail.com。",
    q1: '什麼是 OnePreview？',
    a1: 'OnePreview 是一款全能型 Apple 生態多平台預覽增強工具。它擴展了系統原生的「空白鍵預覽」能力，讓您在不打開專門編輯軟體的情況下，快速預覽原生不支援的檔案格式（如 Markdown 渲染、Swift/JSON 程式碼高亮等）。',
    q2: '如何在 macOS 上使用 OnePreview？',
    a2_1: '1. 首次使用請務必打開一次主應用 “OnePreview” ，以便向 macOS 系統註冊預覽擴展。',
    a2_2: '2. 註冊成功後，在 Finder 中選中支援的檔案（如 `.md` 檔案），直接按下<b>空白鍵</b>即可獲得豐富的預覽。',
    q3: '如何在 iOS / iPadOS 上使用？',
    a3_1: '1. 確保您的裝置上已經安裝了 “OnePreview” App。',
    a3_2: '2. 打開系統自帶的 “檔案” App，長按需要預覽的檔案，選擇「快速查看」（或直接點擊檔案），即可享受精美的渲染效果。',
    q4: '我需要一直保持 OnePreview App 打開嗎？',
    a4: '不需要。在 Mac 上首次運行主程式註冊擴展後，您就可以隨時關閉它。快速查看擴展會在背景根據系統調度自動生效。',
    q5: '目前支援哪些檔案格式？',
    a5_1: '• <b>Markdown:</b> 精美的 HTML 樣式渲染，並帶有原始碼語法高亮。',
    a5_2: '• <b>原始碼:</b> Swift, Python, JS, C++, Shell 等主流程式語言的高亮。',
    a5_3: '• <b>結構化數據:</b> JSON, YAML, XML 顏色高亮，以及將 CSV/TSV 渲染為整潔的表格。',
    a5_4: '• <b>資料夾:</b> 直接預覽一個資料夾內部的結構，包括檔案大小和修改日期。',
    q6: '為什麼我修改了 Markdown 檔案後，預覽內容沒有立刻更新？',
    a6: 'macOS 的 Quick Look 機制偶爾會進行底層快取。您可以先關閉當前預覽視窗（再次按下空白鍵），然後重新按下空白鍵觸發刷新。',
    q7: '為什麼 Markdown 裡的圖片加載不出來？',
    a7: '受限於 Apple 嚴苛的沙盒安全策略，預覽擴展在讀取文件內部引用的其他本地檔案時會受到限制。我們採用了相應技術盡可能繞過同級目錄檔案的讀取限制，但在大多數情況下，使用網路連結 (`https://...`) 作為圖片地址是更為可靠的選擇。',
    q8: '為什麼不支援預覽「垃圾桶」裡的檔案？',
    a8: 'macOS 具有極嚴苛的底層安全限制（系統完整性保護），它會徹底在系統級屏蔽所有第三方 Quick Look 擴展讀取垃圾桶內的檔案。這是 Apple 的安全機制決定的，您必須將檔案移出垃圾桶後才能正常使用空白鍵預覽。',
    footer: '有任何疑問或需要反饋 Bug？請聯繫我們：cameoshell09@gmail.com'
  },
  "hi": {
    title: "OnePreview FAQ",
    view_faq: "FAQ देखें",
    intro_subtitle: "Apple इकोसिस्टम के लिए ऑल-इन-वन प्रीव्यू एन्हांसमेंट।",
    privacy_title: "गोपनीयता नीति",
    back_home: "होम पर वापस जाएं",
    p_intro: "OnePreview आपकी गोपनीयता का सम्मान करता है। यह नीति आपके डेटा के संबंध में हमारी प्रथाओं के बारे में बताती है।",
    p_h1: "1. सूचना संग्रह",
    p_p1: "OnePreview कोई व्यक्तिगत जानकारी एकत्र नहीं करता है। हमें खाता पंजीकरण की आवश्यकता नहीं है, और न ही हम आपके उपयोग, की स्टोक्स या प्रीव्यू सेवा से संबंधित नहीं होने वाले किसी भी डेटा को ट्रैक करते हैं।",
    p_h2: "2. डेटा भंडारण",
    p_p2: "आपकी सभी सेटिंग्स और प्राथमिकताएं आपके डिवाइस पर स्थानीय रूप से संग्रहीत की जाती हैं। हम आपकी फाइलों या मेटाडेटा को किसी भी सर्वर पर अपलोड नहीं करते हैं।",
    p_h3: "3. सैंडबॉक्स सुरक्षा",
    p_p3: "ऐप Apple के सख्त सैंडबॉक्स वातावरण के भीतर काम करता है। यह केवल उन फ़ाइलों तक पहुँचता है जिन्हें आप सिस्टम क्विक लुक तंत्र का उपयोग करके पूर्वावलोकन करने के लिए स्पष्ट रूप से चुनते हैं।",
    p_h4: "4. तृतीय पक्ष",
    p_p4: "हम आपके डेटा को तीसरे पक्ष के साथ साझा नहीं करते हैं क्योंकि हम पहले स्थान पर कोई डेटा एकत्र नहीं करते हैं।",
    p_h5: "5. संपर्क",
    p_p5: "यदि आपके कोई प्रश्न हैं, तो कृपया हमसे cameoshell09@gmail.com पर संपर्क करें।",
    q1: 'OnePreview क्या है?',
    a1: 'OnePreview Apple इकोसिस्टम के लिए एक शक्तिशाली क्विक लुक एन्हांसमेंट टूल है। यह आपको उन फाइलों का तुरंत पूर्वावलोकन करने की अनुमति देता है जो मूल रूप से समर्थित नहीं हैं (जैसे मार्कडाउन, स्विफ्ट, JSON, CSV) बस स्पेसबार दबाकर, बिना किसी समर्पित ऐप को खोले।',
    q2: 'macOS पर OnePreview का उपयोग कैसे करें?',
    a2_1: '1. macOS के साथ एक्सटेंशन को पंजीकृत करने के लिए एक बार "OnePreview" ऐप खोलें।',
    a2_2: '2. Finder में, एक समर्थित फ़ाइल चुनें (जैसे, एक `.md` या `.swift` फ़ाइल) और समृद्ध पूर्वावलोकन देखने के लिए बस <b>Spacebar</b> दबाएं।',
    q3: 'iOS या iPadOS पर OnePreview का उपयोग कैसे करें?',
    a3_1: '1. सुनिश्चित करें कि "OnePreview" आपके डिवाइस पर इंस्टॉल है।',
    a3_2: '2. सिस्टम "Files" ऐप खोलें, किसी फाइल पर लॉन्ग-प्रेस करें, और खूबसूरती से रेंडर की गई सामग्री देखने के लिए "Quick Look" चुनें (या बस फाइल पर टैप करें)।',
    q4: 'क्या मुझे OnePreview ऐप खुला रखने की आवश्यकता है?',
    a4: 'नहीं। macOS पर पहली बार ऐप लॉन्च करने के बाद (जो एक्सटेंशन को पंजीकृत करने के लिए आवश्यक है), आप इसे बंद कर सकते हैं। प्रीव्यू एक्सटेंशन बैकग्राउंड में निर्बाध रूप से काम करता है।',
    q5: 'कौन से फ़ाइल स्वरूप समर्थित हैं?',
    a5_1: '• <b>Markdown:</b> खूबसूरती से रेंडर किया गया HTML और सोर्स सिंटैक्स हाइलाइटिंग।',
    a5_2: '• <b>सोर्स कोड:</b> Swift, Python, JS, C++, Shell, आदि।',
    a5_3: '• <b>स्ट्रक्चर्ड डेटा:</b> सिंटैक्स रंगों के साथ JSON, YAML, XML, और CSV/TSV साफ तालिकाओं के रूप में रेंडर किए गए।',
    a5_4: '• <b>फ़ोल्डर्स:</b> फाइल साइज और संशोधन तिथियों सहित निर्देशिका के अंदर की सामग्री का पूर्वावलोकन करें।',
    q6: 'मार्कडाउन फ़ाइल संपादित करने के तुरंत बाद प्रीव्यू अपडेट क्यों नहीं होता है?',
    a6: 'macOS क्विक लुक कभी-कभी प्रीव्यू को कैश कर लेता है। आप प्रीव्यू विंडो को बंद कर सकते हैं (फिर से स्पेसबार दबाएं) और रिफ्रेश करने के लिए इसे फिर से खोल सकते हैं।',
    q7: 'मेरे मार्कडाउन इमेज लोड नहीं हो रहे हैं, क्यों?',
    a7: 'Apple की सख्त सैंडबॉक्स सुरक्षा नीतियों के कारण, एक्सटेंशन को कभी-कभी दस्तावेजों के अंदर संदर्भित स्थानीय फाइलों को पढ़ने में प्रतिबंधों का सामना करना पड़ता है। हम संभव होने पर इसके आसपास के तरीकों का उपयोग करते हैं, लेकिन रिमोट वेब यूआरएल (`https://...`) आमतौर पर छवियों के लिए सबसे विश्वसनीय होते हैं।',
    q8: 'ट्रैश में फाइलों के लिए OnePreview काम क्यों नहीं करता है?',
    a8: 'macOS में ट्रैश निर्देशिका के लिए सख्त सिस्टम-स्तरीय सुरक्षा प्रतिबंध हैं। तृतीय-पक्ष क्विक लुक एक्सटेंशन को ऑपरेटिंग सिस्टम द्वारा ट्रैश में स्थित फाइलों तक पहुँचने से पूरी तरह से रोक दिया जाता है। पूर्वावलोकन करने के लिए आपको फ़ाइल को ट्रैश से बाहर ले जाना होगा।',
    footer: 'प्रश्न हैं या समर्थन चाहिए? हमसे cameoshell09@gmail.com पर संपर्क करें'
  }
};

function setLanguage(lang) {
  const t = translations[lang] || translations['en'];

  // Update direction for Arabic (kept logic in case we add it later)
  if (lang === 'ar') {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  } else {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = lang;
  }

  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      if (el.tagName === 'P' || el.querySelector('a') || key.startsWith('a') || key.startsWith('q')) {
        // for content with HTML links or tags
        el.innerHTML = t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });

  // Update selector value if page loaded with saved lang
  const selector = document.getElementById('language-selector');
  if (selector && selector.value !== lang) {
    selector.value = lang;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let initialLang = localStorage.getItem('help_page_language');

  if (!initialLang) {
    // Auto-detect language
    const browserLang = navigator.language || navigator.userLanguage;
    const supportedLangs = Object.keys(translations);

    if (browserLang === 'zh-HK' || browserLang === 'zh-SG') {
      // Map specific Chinese locales
      initialLang = (browserLang === 'zh-HK') ? 'zh-TW' : 'zh-CN';
    } else {
      // Try strict match first
      if (supportedLangs.includes(browserLang)) {
        initialLang = browserLang;
      } else {
        // Try prefix match (e.g. fr-CA -> fr)
        const prefix = browserLang.split('-')[0];
        if (supportedLangs.includes(prefix)) {
          initialLang = prefix;
        }
      }
    }
  }

  // Default to English if detection failed or no match
  if (!initialLang || !translations[initialLang]) {
    initialLang = 'en';
  }

  const selector = document.getElementById('language-selector');

  if (selector) {
    selector.value = initialLang;
    selector.addEventListener('change', (e) => {
      const newLang = e.target.value;
      setLanguage(newLang);
      localStorage.setItem('help_page_language', newLang);
    });
  }

  setLanguage(initialLang);
});
