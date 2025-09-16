// frontend/src/assets/whitepapers/ImagingAIWhitePaperPage_ar.jsx
// النسخة العربية من الورقة البحثية حول الذكاء الاصطناعي في التصوير التشخيصي

import React, { useEffect, useRef } from 'react';
import { Container, Paper, Typography, Box, Divider, List, ListItem, ListItemText, Link, Button, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useHeaderVisibility, HEADER_MODES } from '../../contexts/HeaderVisibilityContext';
import jsPDF from 'jspdf';
import logoImage from '../../assets/branding/full_logo_high.png';

// Import figures from the new subdirectory - Fixed paths relative to new location
import figure1Url from '../images/WhitePaper_AI_In_Diagnostic_imaging/Figure1-ROC-Curve.png';
import figure2Url from '../images/WhitePaper_AI_In_Diagnostic_imaging/Figure2-Sensitivity-And-Specificity.png';
import figure3Url from '../images/WhitePaper_AI_In_Diagnostic_imaging/Figure3-Average-Time-To-Diagnosis.png';
import figure4Url from '../images/WhitePaper_AI_In_Diagnostic_imaging/Figure4-HeatMap.png';

// Component to display figures with title and caption/citation
const FigureDisplay = ({ imageUrl, title, caption }) => (
  <Paper elevation={1} sx={{ p: 2, my: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', textAlign: 'right' }}>{title}</Typography>
    <Box 
      component="img"
      src={imageUrl}
      alt={title}
      sx={{ 
        maxWidth: '100%', 
        height: 'auto', 
        my: 1, 
        border: '1px solid', 
        borderColor: 'divider' 
      }} 
    />
    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary', fontStyle: 'italic', textAlign: 'right' }}>
      {caption}
    </Typography>
  </Paper>
);

function ImagingAIWhitePaperPage_ar() {
  const { setHeaderMode } = useHeaderVisibility();
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    setHeaderMode(HEADER_MODES.VISIBLE);
    window.scrollTo(0, 0); // Scroll to top when component mounts
  }, [setHeaderMode]);

  const addWrappedText = (doc, text, x, y, maxWidth, options = {}) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y, options);
    // Calculate height based on font size and line height factor
    const fontSize = doc.internal.getFontSize();
    const lineHeightFactor = options.lineHeightFactor || 1.15; // Default line height
    const textHeight = lines.length * fontSize * lineHeightFactor / doc.internal.scaleFactor;
    return y + textHeight;
  };

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // 1. Add Logo
      const logoWidth = 120;
      doc.addImage(logoImage, 'PNG', margin, currentY, logoWidth, 0);
      const estimatedLogoHeight = logoWidth * (38 / 200);
      currentY += estimatedLogoHeight + 25;

      // --- Document Content in Arabic --- 
      doc.setFontSize(18);
      currentY = addWrappedText(doc, 'الذكاء الاصطناعي في التصوير التشخيصي', pageWidth / 2, currentY, contentWidth, { align: 'center' });
      currentY += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      currentY = addWrappedText(doc, 'بقلم: د. رون روبين وساندي مايلز\nتقنيات مايند سبرينغ الصحية\nronrubin@virtualmd.app', pageWidth / 2, currentY, contentWidth, { align: 'center' });
      currentY += 25;
      doc.setTextColor(0);
      
      // Helper to add section content
      const addSection = (title, content) => {
        if (currentY > pageHeight - margin - 50) { 
          doc.addPage();
          currentY = margin;
        }
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        currentY = addWrappedText(doc, title, margin, currentY, contentWidth);
        currentY += 5;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        currentY = addWrappedText(doc, content, margin, currentY + 2, contentWidth);
        currentY += 15;
      };
      
      // Helper to add figures
      const addFigure = (figUrl, title, caption, format = 'PNG') => {
         const estimatedFigHeight = 150;
         const spaceForCaption = 50;
         if (currentY > pageHeight - margin - estimatedFigHeight - spaceForCaption) { 
           doc.addPage();
           currentY = margin;
         }
         doc.setFontSize(10);
         doc.setFont(undefined, 'bold');
         currentY = addWrappedText(doc, title, margin, currentY, contentWidth);
         currentY += 8;
         
         const imgStartY = currentY;
         let actualImageHeight = 0;
         try {
             const imgWidth = contentWidth * 0.7;
             doc.addImage(figUrl, 'PNG', margin + (contentWidth - imgWidth) / 2, currentY, imgWidth, 0); 
             actualImageHeight = imgWidth * 0.75;
         } catch (e) {
             console.error("Error adding image:", e);
             currentY = addWrappedText(doc, `[خطأ في إضافة الصورة: ${title}]`, margin, currentY, contentWidth);
         }
         
         currentY = imgStartY + actualImageHeight + 10;
         doc.setFontSize(8);
         doc.setFont(undefined, 'italic');
         currentY = addWrappedText(doc, caption, margin, currentY, contentWidth);
         currentY += 20;
         doc.setFont(undefined, 'normal');
      }

      // Add Sections in Arabic
      addSection('الملخص', 
        `برز الذكاء الاصطناعي بسرعة كأداة تحويلية في التصوير التشخيصي، حيث يُظهر أداءً على مستوى الخبراء عبر الأشعة وعلم الأمراض وطب العيون وأمراض الجهاز الهضمي. نستعرض أحدث ما توصل إليه العلم في التصوير المدعوم بالذكاء الاصطناعي، بما في ذلك التجارب السريرية والأنظمة المعتمدة من إدارة الغذاء والدواء الأمريكية مثل الفحص المستقل للشبكية لاعتلال الشبكية السكري، والكشف المدعوم بالذكاء الاصطناعي للزوائد اللحمية في التنظير القولوني، وأدوات التعلم العميق في التشخيص بالتصوير الطبي. تشير الأدلة من الدراسات المستقبلية إلى أن الذكاء الاصطناعي يمكن أن يحسن الحساسية وكفاءة سير العمل - على سبيل المثال، زاد نظام ذكاء اصطناعي من الكشف عن سرطان الثدي بنسبة 29% في فحص الماموجرافيا دون زيادة الإيجابيات الخاطئة، بينما قلل من عبء عمل أطباء الأشعة بما يقارب النصف. في علم الأمراض، حققت خوارزميات الذكاء الاصطناعي حساسية شبه مثالية في الكشف عن السرطان في الصور الشريحية الكاملة، وفي طب العيون حقق نظام ذكاء اصطناعي مستقل لاعتلال الشبكية السكري حساسية 87% وخصوصية 91% في بيئة الرعاية الأولية. نناقش مقاييس الأداء من التجارب الحديثة، ونفحص التحديات بما في ذلك القابلية للتعميم عبر السكان، والتحيز في بيانات التدريب، والمشهد التنظيمي المتطور للأجهزة الطبية القائمة على الذكاء الاصطناعي. بينما أظهر الذكاء الاصطناعي إمكانية لتعزيز دقة التشخيص والكفاءة، فإن التحقق السريري الدقيق والإشراف أمران ضروريان لضمان التكامل الآمن في الممارسة.`
      );

      addSection('المقدمة', 
        `مكنت التطورات في التعلم الآلي، وخاصة الشبكات العصبية التطويرية العميقة، أنظمة الذكاء الاصطناعي من تفسير الصور الطبية بدقة غير مسبوقة. تواجه الأشعة والمجالات الأخرى الغنية بالصور أحجام تصوير متزايدة وقيود القوى العاملة، مما يحفز الاهتمام بالذكاء الاصطناعي كوسيلة لتحسين كفاءة التشخيص واتساقه. على مدى العقد الماضي، تم تطوير خوارزميات الذكاء الاصطناعي لاكتشاف التشوهات في الصور الطبية التي تتراوح من الأشعة السينية والتصوير المقطعي المحوسب إلى شرائح علم الأمراض الرقمية وصور الشبكية. أظهرت الدراسات المبكرة دقة عالية في البيئات المضبوطة، مما حفز عشرات من أدوات الذكاء الاصطناعي للحصول على التصريح التنظيمي للاستخدام السريري. والجدير بالذكر أنه في عام 2018، صرحت إدارة الغذاء والدواء الأمريكية بأول نظام تشخيص ذكاء اصطناعي مستقل (IDx-DR) لاكتشاف اعتلال الشبكية السكري. منذ ذلك الحين، دخل انتشار من أجهزة التصوير المدعومة بالذكاء الاصطناعي إلى الممارسة، مما أثار تقييمات لأدائها في العالم الحقيقي وتأثيرها على النتائج السريرية. توفر هذه المراجعة نظرة عامة شاملة على أحدث ما توصل إليه الذكاء الاصطناعي في التصوير التشخيصي، وتلخص الأدلة من التجارب السريرية الحديثة عبر تخصصات متعددة وتسلط الضوء على الاعتبارات التكنولوجية والتنظيمية الرئيسية.`
      );

      addSection('الطرق/التقنيات', 
        `يعتمد الذكاء الاصطناعي الحديث في التصوير بشكل أساسي على التعلم العميق المدرب على مجموعات بيانات كبيرة مُصنفة. يمكن للشبكات العصبية التطويرية أن تتعلم تلقائياً ميزات بصرية معقدة، مما يمكن من تصنيف الصور (مثل اكتشاف المرض مقابل الطبيعي) واكتشاف الكائنات أو التجزئة (مثل تحديد الآفات). تم تصميم العديد من أدوات الذكاء الاصطناعي كمساعدات تشخيصية معززة: تحلل الصور وتوفر النتائج (مثل مربعات الحدود، والخرائط الحرارية، أو القياسات التلقائية) لمساعدة الأطباء، الذين يحتفظون بسلطة التفسير النهائية. في حالات أخرى، تعمل أنظمة الذكاء الاصطناعي المستقلة بدون إشراف متخصص لأغراض الفحص. على سبيل المثال، نظام IDx-DR لاعتلال الشبكية السكري مستقل، ينتج قرار إحالة من صور الشبكية دون الحاجة إلى طبيب عيون. عادة ما يتم تقييم خوارزميات الذكاء الاصطناعي على مجموعات اختبار استعادية باستخدام مقاييس مثل الحساسية والخصوصية والمنطقة تحت منحنى ROC (AUC). بشكل متزايد، يتم استخدام التجارب السريرية المستقبلية لقياس الأداء في العالم الحقيقي، وكفاءة سير العمل، والتأثير على التباين بين المراقبين. تشمل مقاييس الأداء الرئيسية حساسية الكشف (جزء الإيجابيات الحقيقية المحددة)، والخصوصية (السلبيات الحقيقية المحددة بشكل صحيح)، والقيم التنبؤية الإيجابية/السلبية، بالإضافة إلى AUC لتلخيص الدقة الإجمالية. بالإضافة إلى ذلك، تفحص الدراسات تحسينات الوقت إلى التشخيص (مثل الإبلاغ الأسرع عن النتائج الحرجة) والتباين بين المراقبين - ما إذا كان الذكاء الاصطناعي يقلل التباين من خلال توفير معيار ثابت. لقد مسحنا الدراسات المراجعة من النظراء والملفات التنظيمية لجمع أعلى مستوى من الأدلة على أداء الذكاء الاصطناعي في المهام السريرية للتصوير.`
      );

      // Continue with Results section (abbreviated for space)
      addSection('النتائج', 
        `تشمل تطبيقات الذكاء الاصطناعي في الأشعة طرق التصوير من الأشعة السينية البسيطة إلى التصوير المقطعي المحوسب والرنين المغناطيسي والماموجرافيا. أظهرت الدراسات الاستعادية الكبيرة في البداية أن الذكاء الاصطناعي يمكن أن يضاهي أو يتفوق على أداء أطباء الأشعة في اكتشاف نتائج معينة. في الطب النفسي الرقمي، أصبح مجالاً خصباً للذكاء الاصطناعي لأن صور الشرائح الكاملة تحتوي على بيانات وفيرة يمكن أن تكون مرهقة لأطباء الأمراض لمراجعتها بشكل شامل. حققت محللات الصور القائمة على الذكاء الاصطناعي دقة ملحوظة في اكتشاف الأورام الخبيثة في شرائح علم الأمراض النسيجية. في طب العيون، كان من بين المجالات الأولى لتنفيذ تشخيصات الذكاء الاصطناعي المستقلة. في أمراض الجهاز الهضمي والتنظير، يتم استخدام تحليل الصور في الوقت الفعلي القائم على الذكاء الاصطناعي لتعزيز اكتشاف الآفات.`
      );

      addSection('المناقشة', 
        `تظهر هذه النتائج مجتمعة أن الذكاء الاصطناعي قد نضج من إثباتات المفهوم المخبرية إلى أدوات مُحققة سريرياً عبر تخصصات التصوير المتنوعة. الدقة التشخيصية: غالباً ما تحقق خوارزميات الذكاء الاصطناعي حساسية وخصوصية على قدم المساواة مع الأطباء ذوي الخبرة للمهام المحددة. الكفاءة وسير العمل: إلى جانب الدقة، يقدم الذكاء الاصطناعي مكاسب في الكفاءة. التباين بين المراقبين: يوفر الذكاء الاصطناعي تفسيراً موحداً يمكن أن يكون نقطة مرجعية. رغم هذه النتائج الواعدة، هناك عدة تحديات وقيود يجب معالجتها. القابلية للتعميم: يمكن أن تعاني نماذج الذكاء الاصطناعي من تدهور الأداء عند نشرها في مجموعات سكانية أو بيئات تختلف عن بيانات التدريب. التحيز: يمكن للذكاء الاصطناعي أن يرث التحيزات الموجودة في مجموعات بيانات التدريب. الرقابة التنظيمية: الإطار التنظيمي للذكاء الاصطناعي في الطب يتطور. التكامل والتدريب: يتطلب النشر الناجح لأدوات الذكاء الاصطناعي التكامل في سير العمل السريري وتدريب المستخدمين النهائيين لتفسير مخرجات الذكاء الاصطناعي بشكل صحيح.`
      );

      addSection('الخلاصة', 
        `تقدم التصوير التشخيصي المدعوم بالذكاء الاصطناعي من المفهوم إلى الواقع، مع أدلة قوية تُظهر تحسينات في الأداء التشخيصي والكفاءة عبر الأشعة وعلم الأمراض وطب العيون وأمراض الجهاز الهضمي. مع ذلك، فإن تحقيق الإمكانات الكاملة للذكاء الاصطناعي في الرعاية الصحية سيتطلب انتباهاً دقيقاً لقيوده. إن ضمان تدريب الخوارزميات والتحقق منها على مجموعات سكانية متنوعة، وتخفيف التحيز، وإنشاء آليات تنظيمية لتحسين الخوارزمية المستمر أمور بالغة الأهمية. باختصار، يمثل الذكاء الاصطناعي في التصوير التشخيصي خطوة مهمة نحو رعاية صحية أكثر دقة وكفاءة وإمكانية وصول، ولكن يجب تنفيذه بدقة وإشراف.`
      );

      // Save PDF with Arabic name
      doc.save('الذكاء_الاصطناعي_في_التصوير_التشخيصي_مايند_سبرينغ.pdf');

    } catch (error) {
      console.error("Error generating Arabic PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, direction: 'rtl' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={isGeneratingPdf ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
        >
          {isGeneratingPdf ? 'جارٍ الإنشاء...' : 'تحميل ملف PDF'}
        </Button>
      </Box>
      
      <Paper ref={contentRef} elevation={3} sx={{ p: { xs: 2, sm: 3, md: 5 }, direction: 'rtl' }}>
        
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 1 }}>
          الذكاء الاصطناعي في التصوير التشخيصي
        </Typography>
        
        {/* Author Information */}
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          <i>د. رون روبين وساندي مايلز</i><br />
          تقنيات مايند سبرينغ الصحية<br />
          <Link href="mailto:ronrubin@virtualmd.app">ronrubin@virtualmd.app</Link> <br />
          <Link href="mailto:sandy@virtualmd.app">sandymiles@virtualmd.app</Link>
        </Typography>
        
        {/* Abstract */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'right' }}>الملخص</Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            برز الذكاء الاصطناعي بسرعة كأداة تحويلية في التصوير التشخيصي، حيث يُظهر أداءً على مستوى الخبراء عبر الأشعة وعلم الأمراض وطب العيون وأمراض الجهاز الهضمي. نستعرض أحدث ما توصل إليه العلم في التصوير المدعوم بالذكاء الاصطناعي، بما في ذلك التجارب السريرية والأنظمة المعتمدة من إدارة الغذاء والدواء الأمريكية مثل الفحص المستقل للشبكية لاعتلال الشبكية السكري، والكشف المدعوم بالذكاء الاصطناعي للزوائد اللحمية في التنظير القولوني، وأدوات التعلم العميق في التشخيص بالتصوير الطبي. تشير الأدلة من الدراسات المستقبلية إلى أن الذكاء الاصطناعي يمكن أن يحسن الحساسية وكفاءة سير العمل - على سبيل المثال، زاد نظام ذكاء اصطناعي من الكشف عن سرطان الثدي بنسبة 29% في فحص الماموجرافيا دون زيادة الإيجابيات الخاطئة، بينما قلل من عبء عمل أطباء الأشعة بما يقارب النصف. في علم الأمراض، حققت خوارزميات الذكاء الاصطناعي حساسية شبه مثالية في الكشف عن السرطان في الصور الشريحية الكاملة، وفي طب العيون حقق نظام ذكاء اصطناعي مستقل لاعتلال الشبكية السكري حساسية 87% وخصوصية 91% في بيئة الرعاية الأولية. نناقش مقاييس الأداء من التجارب الحديثة، ونفحص التحديات بما في ذلك القابلية للتعميم عبر السكان، والتحيز في بيانات التدريب، والمشهد التنظيمي المتطور للأجهزة الطبية القائمة على الذكاء الاصطناعي. بينما أظهر الذكاء الاصطناعي إمكانية لتعزيز دقة التشخيص والكفاءة، فإن التحقق السريري الدقيق والإشراف أمران ضروريان لضمان التكامل الآمن في الممارسة.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4 }} />

        {/* Introduction */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'right' }}>المقدمة</Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            مكنت التطورات في التعلم الآلي، وخاصة الشبكات العصبية التطويرية العميقة، أنظمة الذكاء الاصطناعي من تفسير الصور الطبية بدقة غير مسبوقة. تواجه الأشعة والمجالات الأخرى الغنية بالصور أحجام تصوير متزايدة وقيود القوى العاملة، مما يحفز الاهتمام بالذكاء الاصطناعي كوسيلة لتحسين كفاءة التشخيص واتساقه. على مدى العقد الماضي، تم تطوير خوارزميات الذكاء الاصطناعي لاكتشاف التشوهات في الصور الطبية التي تتراوح من الأشعة السينية والتصوير المقطعي المحوسب إلى شرائح علم الأمراض الرقمية وصور الشبكية.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4 }} />

        {/* Methods/Technologies */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'right' }}>الطرق/التقنيات</Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            يعتمد الذكاء الاصطناعي الحديث في التصوير بشكل أساسي على التعلم العميق المدرب على مجموعات بيانات كبيرة مُصنفة. يمكن للشبكات العصبية التطويرية أن تتعلم تلقائياً ميزات بصرية معقدة، مما يمكن من تصنيف الصور واكتشاف الكائنات أو التجزئة. تم تصميم العديد من أدوات الذكاء الاصطناعي كمساعدات تشخيصية معززة تحلل الصور وتوفر النتائج لمساعدة الأطباء.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Results */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'right' }}>النتائج</Typography>
          
          {/* Radiology Section */}
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3, textAlign: 'right' }}>الأشعة</Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            تشمل تطبيقات الذكاء الاصطناعي في الأشعة طرق التصوير من الأشعة السينية البسيطة إلى التصوير المقطعي المحوسب والرنين المغناطيسي والماموجرافيا. أظهرت الدراسات الاستعادية الكبيرة في البداية أن الذكاء الاصطناعي يمكن أن يضاهي أو يتفوق على أداء أطباء الأشعة في اكتشاف نتائج معينة.
          </Typography>
          
          <FigureDisplay 
             imageUrl={figure4Url} 
             title="الشكل 4. الخريطة الحرارية للذكاء الاصطناعي تبرز العقدة الرئوية الخفية"
             caption="الأشعة السينية للصدر مع خريطة حرارية مولدة بالذكاء الاصطناعي (أحمر→أصفر) تحدد عقدة رئوية منفردة غير مرئية بوضوح في المراجعة البشرية الأولية."
          />

          {/* Pathology Section */}
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 4, textAlign: 'right' }}>علم الأمراض</Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            أصبح علم الأمراض الرقمي مجالاً خصباً للذكاء الاصطناعي لأن صور الشرائح الكاملة تحتوي على بيانات وفيرة يمكن أن تكون مرهقة لأطباء الأمراض لمراجعتها بشكل شامل. حققت محللات الصور القائمة على الذكاء الاصطناعي دقة ملحوظة في اكتشاف الأورام الخبيثة في شرائح علم الأمراض النسيجية.
          </Typography>

          {/* Ophthalmology Section */}
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 4, textAlign: 'right' }}>طب العيون</Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            كان طب العيون من بين المجالات الأولى لتنفيذ تشخيصات الذكاء الاصطناعي المستقلة. يتطلب فحص اعتلال الشبكية السكري تقليدياً تفسير طبيب العيون لصور قاع العين، وهو حاجز للفحص الواسع. يعالج نظام IDx-DR المعتمد من إدارة الغذاء والدواء هذه الفجوة من خلال تحليل صور قاع العين تلقائياً لاعتلال الشبكية السكري.
          </Typography>
          
          <FigureDisplay 
             imageUrl={figure1Url} 
             title="الشكل 1. منحنى ROC: نظام الذكاء الاصطناعي لاعتلال الشبكية السكري"
             caption="المصدر: Abramoff MD, Lavin PT, Birch M, Shah N, Folk JC. التجربة المحورية لنظام تشخيص مستقل قائم على الذكاء الاصطناعي للكشف عن اعتلال الشبكية السكري في عيادات الرعاية الأولية."
          />

          {/* Gastroenterology Section */}
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 4, textAlign: 'right' }}>أمراض الجهاز الهضمي</Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            في التنظير الداخلي للجهاز الهضمي، يتم استخدام تحليل الصور في الوقت الفعلي القائم على الذكاء الاصطناعي لتعزيز اكتشاف الآفات. المثال الأساسي هو الكشف المدعوم بالحاسوب للزوائد اللحمية القولونية المستقيمية أثناء تنظير القولون.
          </Typography>
        </Box>
        
        <FigureDisplay 
           imageUrl={figure2Url} 
           title="الشكل 2. الحساسية والخصوصية في دراسات الذكاء الاصطناعي الرئيسية للتصوير"
           caption="المصادر: Abramoff MD, et al. NPJ Digit Med. 2018; Mori Y, et al. Ann Intern Med. 2018;169(6):357–366; Steiner DF, et al. Am J Surg Pathol. 2018;42(6):828–833."
        />

        <FigureDisplay 
           imageUrl={figure3Url} 
           title="الشكل 3. متوسط الوقت للتشخيص: يدوي مقابل مدعوم بالذكاء الاصطناعي"
           caption="المصدر: Topol EJ. الطب عالي الأداء: تقارب الذكاء البشري والاصطناعي. Nature Medicine. 2019;25(1):44–56."
        />
        
        <Divider sx={{ my: 4 }} />

        {/* Discussion */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'right' }}>المناقشة</Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            تظهر هذه النتائج مجتمعة أن الذكاء الاصطناعي قد نضج من إثباتات المفهوم المخبرية إلى أدوات مُحققة سريرياً عبر تخصصات التصوير المتنوعة. الدقة التشخيصية: غالباً ما تحقق خوارزميات الذكاء الاصطناعي حساسية وخصوصية على قدم المساواة مع الأطباء ذوي الخبرة للمهام المحددة. الكفاءة وسير العمل: إلى جانب الدقة، يقدم الذكاء الاصطناعي مكاسب في الكفاءة. التباين بين المراقبين: يوفر الذكاء الاصطناعي تفسيراً موحداً يمكن أن يكون نقطة مرجعية.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4 }} />

        {/* Conclusion */}
        <Box sx={{ mb: 4 }}>
           <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'right' }}>الخلاصة</Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            تقدم التصوير التشخيصي المدعوم بالذكاء الاصطناعي من المفهوم إلى الواقع، مع أدلة قوية تُظهر تحسينات في الأداء التشخيصي والكفاءة عبر الأشعة وعلم الأمراض وطب العيون وأمراض الجهاز الهضمي. مع ذلك، فإن تحقيق الإمكانات الكاملة للذكاء الاصطناعي في الرعاية الصحية سيتطلب انتباهاً دقيقاً لقيوده. باختصار، يمثل الذكاء الاصطناعي في التصوير التشخيصي خطوة مهمة نحو رعاية صحية أكثر دقة وكفاءة وإمكانية وصول، ولكن يجب تنفيذه بدقة وإشراف.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4 }} />

        {/* References */}
        <Box>
          <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'right' }}>المراجع</Typography>
          <Typography variant="body2" component="div" sx={{ textAlign: 'right' }}>
            <List dense disablePadding>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Abràmoff MD, Lavin PT, Birch M, Shah N, Folk JC. التجربة المحورية لنظام تشخيص مستقل قائم على الذكاء الاصطناعي للكشف عن اعتلال الشبكية السكري في عيادات الرعاية الأولية. NPJ Digital Medicine. 2018;1:39." sx={{ m: 0, textAlign: 'right' }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Lång K, et al. فحص الماموجرافيا المدعوم بالذكاء الاصطناعي: أدلة من تجربة عشوائية (MASAI). Lancet Oncol. 2023;24(8):936-944." sx={{ m: 0, textAlign: 'right' }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Tolkach Y, Ovtcharov V, Pryalukhin A, et al. الذكاء الاصطناعي للكشف عن سرطان البروستاتا وتدريج غليسون في الخزعات: تحقق متعدد المؤسسات. NPJ Precis Oncol. 2023;7:77." sx={{ m: 0, textAlign: 'right' }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Repici A, Badalamenti M, Maselli R, et al. فعالية الكشف المدعوم بالحاسوب في الوقت الفعلي للأورام القولونية المستقيمية في تجربة عشوائية. Gastroenterology. 2020;159(2):512–520.e7." sx={{ m: 0, textAlign: 'right' }} /></ListItem>
            </List>
          </Typography>
        </Box>

      </Paper>
    </Container>
  );
}

export default ImagingAIWhitePaperPage_ar;