import React, { useEffect, useRef } from 'react';
import { Container, Paper, Typography, Box, Divider, List, ListItem, ListItemText, Link, Button, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useHeaderVisibility, HEADER_MODES } from '../../contexts/HeaderVisibilityContext';
import jsPDF from 'jspdf';
import logoImage from '../../assets/branding/full_logo_high.png';

// Component to display figures with title and caption/citation
const FigureDisplay = ({ title, caption }) => (
  <Paper elevation={1} sx={{ p: 2, my: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', textAlign: 'right' }}>{title}</Typography>
    <Box 
      sx={{ 
        width: '100%',
        height: '300px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#e0e0e0',
        border: '1px solid',
        borderColor: 'divider',
        my: 1,
      }} 
    >
      <Typography variant="body2" color="text.secondary">
        [מציין מקום עבור {title}]
      </Typography>
    </Box>
    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary', fontStyle: 'italic', textAlign: 'right' }}>
      {caption}
    </Typography>
  </Paper>
);

function DermatologyAIWhitePaperPage_he() {
  const { setHeaderMode } = useHeaderVisibility();
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    setHeaderMode(HEADER_MODES.VISIBLE);
    window.scrollTo(0, 0);
  }, [setHeaderMode]);

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

      // Add Logo
      const logoWidth = 120;
      doc.addImage(logoImage, 'PNG', margin, currentY, logoWidth, 0);
      const estimatedLogoHeight = logoWidth * (38 / 200);
      currentY += estimatedLogoHeight + 25;

      // Hebrew Document Content
      doc.setFontSize(18);
      currentY = addWrappedText(doc, 'בינה מלאכותית בדרמטולוגיה: שיפור זיהוי וסיווג נגעי עור', pageWidth / 2, currentY, contentWidth, { align: 'center' });
      currentY += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      currentY = addWrappedText(doc, 'מאת: ד\"ר רון רובין וסנדי מיילס\nטכנולוגיות מיינד ספרינג הלת\'\nronrubin@virtualmd.app', pageWidth / 2, currentY, contentWidth, { align: 'center' });
      currentY += 25;
      doc.setTextColor(0);

      doc.save('בינה_מלאכותית_בדרמטולוגיה_מיינד_ספרינג.pdf');

    } catch (error) {
      console.error("Error generating Hebrew PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const addWrappedText = (doc, text, x, y, maxWidth, options = {}) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y, options);
    const fontSize = doc.internal.getFontSize();
    const lineHeightFactor = options.lineHeightFactor || 1.15;
    const textHeight = lines.length * fontSize * lineHeightFactor / doc.internal.scaleFactor;
    return y + textHeight;
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
          {isGeneratingPdf ? 'יוצר...' : 'הורד PDF'}
        </Button>
      </Box>
      
      <Paper ref={contentRef} elevation={3} sx={{ 
        p: { xs: 2, sm: 3, md: 5 },
        bgcolor: '#673AB7',
        color: 'white',
        direction: 'rtl'
      }}>
        
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 1 }}>
          בינה מלאכותית בדרמטולוגיה: שיפור זיהוי וסיווג נגעי עור
        </Typography>
        
        <Typography variant="subtitle1" align="center" sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.8)' }}>
          <i>ד"ר רון רובין וסנדי מיילס</i><br />
          טכנולוגיות מיינד ספרינג הלת'<br />
          <Link href="mailto:ronrubin@virtualmd.app" sx={{ color: '#E1BEE7' }}>ronrubin@virtualmd.app</Link> <br />
          <Link href="mailto:sandy@virtualmd.app" sx={{ color: '#E1BEE7' }}>sandymiles@virtualmd.app</Link>
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'right' }}>תקציר</Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            בינה מלאכותית מהפכה את האבחון הדרמטולוגי על ידי אפשור זיהוי וסיווג מדויק ביותר של נגעי עור מתמונות דיגיטליות. מאמר זה סוקר את החדיש ביותר בדרמטולוגיה מסייעת בינה מלאכותית, כולל אימותים קליניים בקנה מידה גדול ויישומים מתפתחים בטלדרמטולוגיה ובמסגרות טיפול ראשוני. במחקר פורץ דרך מ-2017 שפורסם ב-Nature, רשת עצבית קונבולוציונית עמוקה הדגימה דיוק סיווג ברמת דרמטולוגים מוסמכים לזיהוי מלנומה. ניסויים פרוספקטיביים אחרונים הראו שמערכות בינה מלאכותית יכולות להשיג רגישות וספציפיות העולות על 95% לזיהוי מלנומה מתמונות דרמוסקופיות, מה שעשוי לשפר שיעורי זיהוי מוקדם לסרטן עור קטלני זה. אלגוריתמי בינה מלאכותית הראו גם ביצועים חזקים בסיווג מצבי עור נפוצים כולל אקזמה, פסוריאזיס וקרטוזות אקטיניות, עם שיעורי דיוק בין 80-95% בהתאם למצב. אנו מנתחים מדדי ביצועים על פני ארכיטקטורות בינה מלאכותית שונות, אופני הדמיה ומסגרות קליניות, ודנים באתגרים של פיתוח אלגוריתמים שמכלילים היטב על פני גוני עור מגוונים ומצגות נגעים. בעוד שבינה מלאכותית מחזיקה בהבטחה משמעותית להרחבת גישה למומחיות דרמטולוגית ושיפור דיוק אבחוני, אתגרי יישום כולל פיקוח רגולטורי, הטיית אלגוריתמים ואינטגרציה בזרימות עבודה קליניות חייבים להיטפל כדי להבטיח פריסה שוויונית ויעילה בפרקטיקה של העולם האמיתי.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'right' }}>מבוא</Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            הפרעות עור מהוות אחת הסיבות הנפוצות ביותר לביקורי בריאות ברחבי העולם, כאשר גישה מוגבלת לדרמטולוגים יוצרת פערי טיפול משמעותיים. הערכה ויזואלית מהווה את אבן הפינה של האבחון הדרמטולוגי, מה שהופך את התחום למתאים במיוחד לניתוח תמונות מסייע בינה מלאכותית. הנטל העולמי של מחלות עור משפיע על למעלה מ-1.9 מיליארד אנשים, כאשר סרטני עור מייצגים הן סיכון תמותה משמעותי (מלנומה) והן דאגת תחלואה (סרטני עור לא-מלנומה). זיהוי מוקדם נותר קריטי לתוצאות מוצלחות, במיוחד עבור מלנומה שבה הישרדות 5 שנים יורדת מ-99% למחלה מקומית לפחות מ-30% למקרים מתקדמים.
          </Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            במהלך העשור האחרון, מערכות למידה עמוקה הדגימו יכולות יוצאות דופן בסיווג נגעי עור מתמונות דיגיטליות, הן צילומים קליניים והן תמונות דרמוסקופיות. החל מהעבודה המכוננת של אסטבה ועמיתיו (Nature, 2017), קבוצות מחקר רבות הראו שרשתות עצביות קונבולוציוניות מאומנות היטב יכולות להתאים או לעלות על רמת דיוק של דרמטולוגים במשימות אבחוניות ספציפיות, במיוחד זיהוי מלנומה. מאז, פותחו מערכות רבות לזיהוי הפרעות עור רחב יותר, המשתרע על מצבים דלקתיים, זיהומים וגידולים שפירים.
          </Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            היישומים הפוטנציאליים רחבי השפעה: בינה מלאכותית יכולה להרחיב מומחיות דרמטולוגית למסגרות טיפול ראשוני, לאפשר מיון טלדרמטולוגיה יעיל, לתמוך במעקב עצמי של מטופלים ולתקנן הערכה בניסויים קליניים. עם זאת, אתגרים משמעותיים נותרים בפיתוח אלגוריתמים חזקים שמבצעים באופן עקבי על פני סוגי עור מגוונים, מצגות נגעים ותנאי הדמיה. סקירה זו מסכמת את הראיות האחרונות על ביצועי בינה מלאכותית ביישומים דרמטולוגיים, מעריכה מגבלות נוכחיות ודנה בדרך לקראת יישום קליני אחראי.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'right' }}>שיטות/טכנולוגיות</Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            מערכות בינה מלאכותית דרמטולוגיות עכשוויות משתמשות בעיקר בלמידה עמוקה, עם רשתות עצביות קונבולוציוניות (CNNs) כארכיטקטורת עמוד השדרה לניתוח תמונות. רשתות אלו לומדות אוטומטית תכונות ויזואליות רלוונטיות ממערכי נתונים גדולים של תמונות עור מתויגות עם אבחנות מתאימות. למידת העברה, שבה רשתות מאומנות מראש על מערכי נתונים כלליים מותאמות עבור תמונות דרמטולוגיות, הוכחה כיעילה במיוחד בהתחשב בנדירות היחסית של מערכי נתונים גדולים ומוערים היטב של נגעי עור.
          </Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            גישות טכניות מרכזיות כוללות: (1) מערכות סיווג בינאריות המבחינות בין נגעים ממאירים לשפירים; (2) מערכות מרובות מחלקות המבדילות בין מצבי עור רבים במקביל; ו-(3) רשתות פילוח התוחמות בדיוק גבולות נגעים לניתוח מורפולוגי. רוב המערכות המאומתות קלינית משלבות גישות אלו, תחילה מאתרות נגע, ואז מחלצות תכונות לסיווג.
          </Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            תמונות קלט נופלות בדרך כלל לשתי קטגוריות: צילומים קליניים (תמונות דיגיטליות סטנדרטיות) ותמונות דרמוסקופיות (שנלקחו עם מכשירי הגדלה מיוחדים המבטלים השתקפות פנים). בעוד תמונות דרמוסקופיות מספקות פרטים רבים יותר של מבנים תת-פנימיים חשובים לאבחון מלנומה, צילומים קליניים נגישים יותר ליישומי טלמדיסין וצרכנים. מערכות אחרונות משלבות יותר ויותר מטאדטה קלינית (גיל מטופל, מיקום נגע, תסמינים) לצד תמונות לשיפור דיוק אבחוני.
          </Typography>
        </Box>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'right' }}>תוצאות</Typography>
          
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3, textAlign: 'right' }}>זיהוי מלנומה וסרטן עור</Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            זיהוי מלנומה מייצג את היישום המאומת ביותר של בינה מלאכותית בדרמטולוגיה. במחקר מרכזי שפורסם ב-JAMA Dermatology (2022), חוקרים העריכו מערכת למידה עמוקה על 1,550 תמונות דרמוסקופיות. ה-CNN השיג רגישות של 95.3% וספציפיות של 92.6% לזיהוי מלנומה, עולה על הביצועים הממוצעים של 58 דרמטולוגים (רגישות 90.1%, ספציפיות 88.2%). כאשר דרמטולוגים קיבלו סיוע בינה מלאכותית, דיוק האבחון שלהם השתפר בממוצע של 7.5%, עם הרווחים הגדולים ביותר שנצפו בקרב קלינאים פחות מנוסים.
          </Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            מחקר אימות קליני רב-מרכזי של מערכת למידה עמוקה אחרת על פני 7 אתרים באוסטרליה, אירופה וארצות הברית הדגים ביצועים חזקים בין-אוכלוסיות. מערכת זו שמרה על רגישות מעל 93% על פני סוגי עור שונים של פיצפטריק, אם כי עם ספציפיות מעט נמוכה יותר בגוני עור כהים יותר (87% לעומת 94% בעור בהיר יותר), מה שמדגיש את האתגר המתמשך של הבטחת ביצועים שוויוניים על פני אוכלוסיות מגוונות.
          </Typography>
          
          <FigureDisplay
            title="איור 1. עקומת ROC: מערכת בינה מלאכותית לזיהוי מלנומה"
            caption="עקומת מאפייני פעולת מקלט (ROC) המשווה ביצועי מערכת למידה עמוקה מול דרמטולוגים לזיהוי מלנומה מתמונות דרמוסקופיות. מערכת הבינה המלאכותית (קו כחול) השיגה AUC של 0.96, עולה על ביצועי הדרמטולוג הממוצע (נקודה כתומה). מקור: Phillips M, et al. Assessment of Accuracy of an Artificial Intelligence Algorithm to Detect Melanoma in Images of Skin Lesions. JAMA Dermatol. 2022;158(1):35-42."
          />

          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 4, textAlign: 'right' }}>סיווג מצבי עור לא-סרטניים</Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            מעבר לסרטן עור, מערכות בינה מלאכותית הדגימו יכולת משמעותית בסיווג מצבים דרמטולוגיים נפוצים. מערכת למידה עמוקה מקיפה שאומנה על למעלה מ-220,000 תמונות המשתרעות על 419 מצבי עור השיגה דיוק top-3 של 91.2% על פני כל הספקטרום של הפרעות, דומה לדרמטולוגים מוסמכים בהשוואות פנים אל פנים. עבור 26 מצבי העור הנפוצים ביותר (המהווים כ-80% מביקורי דרמטולוגיה בטיפול ראשוני), דיוק ה-top-1 של המערכת הגיע ל-85.9%.
          </Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            ביצועים חזקים במיוחד נצפו עבור מצבים מובחנים כמו פסוריאזיס (דיוק 93.1%), אקנה וולגריס (90.4%) ואקזמה (88.7%). מצבים עם מצגות עדינות או משתנות יותר, כמו פריחות תרופות או מצבים אוטואימוניים בשלב מוקדם, הראו שיעורי דיוק נמוכים יותר (70-75%), מה שמעיד על אזורים הדורשים שכלול אלגוריתמי נוסף.
          </Typography>
          
          <FigureDisplay
            title="איור 2. דיוק סיווג למצבי עור נפוצים"
            caption="השוואת דיוק אבחוני בין בינה מלאכותית ודרמטולוגים על פני 26 מצבי עור נפוצים. מצבים מסודרים משמאל לימין לפי סדר של שכיחות יורדת. מערכת הבינה המלאכותית (עמודות כחולות) הדגימה ביצועים דומים או עדיפים לדרמטולוגים (עמודות כתומות) עבור רוב המצבים. מקור: Liu Y, et al. A deep learning system for differential diagnosis of skin diseases. Nature Medicine. 2020;26(6):900-908."
          />

          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 4, textAlign: 'right' }}>יישום בעולם האמיתי ויישומי נייד</Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            התרגום של בינה מלאכותית דרמטולוגית ממחקר ליישום קליני הואץ בשנים האחרונות. מספר יישומים מבוססי סמארטפון קיבלו אישור רגולטורי למקרי שימוש ספציפיים. ב-2021, ה-FDA העניק אישור De Novo ל-DermAssist (מ-Skin Analytics) לזיהוי מלנומה מתמונות סמארטפון, לאחר אימות קליני שהראה רגישות של 95.1% לזיהוי מלנומה כאשר נעשה שימוש על ידי אנשי מקצוע בתחום הבריאות.
          </Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            פלטפורמות טלדרמטולוגיה המתוגברות עם יכולות מיון בינה מלאכותית הדגימו שיפורי יעילות משמעותיים בפריסות בעולם האמיתי. ביישום מערכת בריאות גדולה, בדיקה מקדימה של בינה מלאכותית הפחיתה זמן סקירת דרמטולוג ב-21% והקטינה את הזמן הממוצע להתייעצות עבור נגעים בסיכון גבוה מ-34 יום ל-8.1 יום. ציוני שביעות רצון מטופלים עלו גם כן, בעיקר בגלל זמני המתנה קצרים יותר לפגישות ותשומת לב ממוקדת יותר במהלך התייעצויות.
          </Typography>
        </Box>
        
        <FigureDisplay
          title="איור 3. זמן לייעוץ דרמטולוג: הפניה סטנדרטית מול מסייעת בינה מלאכותית"
          caption="זמני המתנה ממוצעים (בימים) לייעוץ דרמטולוגיה על פני רמות דחיפות שונות באמצעות הפניה סטנדרטית מול מיון מסייע בינה מלאכותית. אלגוריתם התעדוף של מערכת הבינה המלאכותית הפחית זמני המתנה בצורה המשמעותית ביותר עבור מקרים בדחיפות גבוהה. מקור: Freeman K, et al. Impact of artificial intelligence-enabled triage on dermatology access and patient outcomes: A cluster randomized clinical trial. JAMA Dermatol. 2022;158(8):1-9."
        />
        
        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'right' }}>דיון</Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            הראיות המצטברות מדגימות שבינה מלאכותית הגיעה לרמות ביצועים המתאימות ליישומים קליניים ספציפיים בדרמטולוגיה. חוזקות של מערכות נוכחיות כוללות רגישות גבוהה לזיהוי ממאירויות, עקביות בהערכה על פני תמונות מרובות ויכולת לעבד נפחים גדולים של מקרים ללא עייפות. יכולות אלו פונות לצרכים משמעותיים במתן טיפול דרמטולוגי, במיוחד בהרחבת מומחיות ברמת מומחה לטיפול ראשוני ואזורים לא מוגשים.
          </Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            אולי היתרון המשמעותי ביותר של יישום בינה מלאכותית הוא הפוטנציאל לשיפור זיהוי מוקדם של סרטני עור, במיוחד מלנומה. באזורים שבהם דרמטולוגים נדירים, שילוב כלי סקירת בינה מלאכותית ברגישות גבוהה ברמת הטיפול הראשוני יכול לזהות נגעים מדאיגים שאחרת עלולים להתקדם ללא הבחנה. השיפור הנצפה בדיוק אבחוני של לא-מומחים כאשר מסוייעים על ידי בינה מלאכותית מציע נתיב בר קיימא להרחבת מומחיות דרמטולוגית מבלי לדרוש הכשרה מחדש נרחבת של מומחים.
          </Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            עם זאת, אתגרים ומגבלות משמעותיים נמשכים. הבולט ביותר בין אלה הוא נושא הטיית אלגוריתמים וביצועים שוויוניים על פני סוגי עור מגוונים. רוב מערכי נתוני האימון כללו היסטורית מעט באופן לא פרופורציונלי דוגמות של מצבי עור כפי שהם מתרחשים בגוני עור כהים יותר, מה שמוביל לפערי ביצועים מתועדים. מאמצים אחרונים לפיתוח סטי אימון מגוונים יותר והערכה ספציפית של אלגוריתמים על פני סוגי עור שונים של פיצפטריק מייצגים צעדים חשובים לקראת טיפול בנושא קריטי זה.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'right' }}>מסקנה</Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            בינה מלאכותית הופיעה ככלי חזק לשיפור טיפול דרמטולוגי, עם מערכות מאומתות המדגימות ביצועים התואמים או עולים על דרמטולוגים במשימות אבחוניות ספציפיות. התקדמויות אלו מגיעות בזמן קריטי, כאשר מחסור בדרמטולוגים ושכיחות סרטן עור עולה יוצרים פערי טיפול משמעותיים באזורים רבים.
          </Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            הראיות החזקות ביותר תומכות ביישום בינה מלאכותית בזיהוי מלנומה, שבו אלגוריתמי רגישות גבוהה יכולים לזהות תכונות ממאירות עדינות ולאפשר אולי אבחון מוקדם יותר. מעבר לסרטן עור, מערכות לסיווג מצבים דרמטולוגיים נפוצים מראות הבטחה להרחבת מומחיות מומחה למסגרות טיפול ראשוני ואזורים לא מוגשים.
          </Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            עם זאת, הדרך ליישום קליני נרחב דורשת טיפול באתגרים משמעותיים. הבטחת ביצועים שוויוניים על פני כל סוגי העור דורשת נתוני אימון מגוונים והערכה קפדנית על פני אוכלוסיות שונות. מסגרות רגולטוריות חייבות להתפתח כדי לטפל במאפיינים הייחודיים של מערכות למידה מתמשכת תוך שמירה על בטיחות מטופלים. אינטגרציה בזרימות עבודה קליניות דורשת תשומת לב קפדנית לגורמים אנושיים וחלוקת משימות מתאימה בין בינה מלאכותית וקלינאים.
          </Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'right' }}>
            עם פיתוח, אימות ויישום מחושבים, לבינה מלאכותית יש פוטנציאל לדמוקרטיזציה של גישה למומחיות דרמטולוגית תוך שיפור דיוק אבחוני ויעילות. המערכות המוצלחות ביותר יהיו כנראה אלו המתוכננות ככלי שיתופיים המגבירים במקום להחליף שיפוט קליני, המאפשרים לנותני טיפול בכל הרמות לספק טיפול דרמטולוגי מדויק, יעיל ושוויוני יותר.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        <Box>
          <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'right' }}>הפניות</Typography>
          <Typography variant="body2" component="div" sx={{ textAlign: 'right' }}>
            <List dense disablePadding>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Esteva A, Kuprel B, Novoa RA, et al. סיווג סרטן עור ברמת דרמטולוג עם רשתות עצביות עמוקות. Nature. 2017;542(7639):115-118." sx={{ m: 0, textAlign: 'right' }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Phillips M, Marsden H, Jaffe W, et al. הערכת דיוק אלגוריתם בינה מלאכותית לזיהוי מלנומה בתמונות נגעי עור. JAMA Dermatol. 2022;158(1):35-42." sx={{ m: 0, textAlign: 'right' }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Liu Y, Jain A, Eng C, et al. מערכת למידה עמוקה לאבחון דיפרנציאלי של מחלות עור. Nature Medicine. 2020;26(6):900-908." sx={{ m: 0, textAlign: 'right' }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Freeman K, Dinnes J, Chuchu N, et al. השפעת מיון מאופשר בינה מלאכותית על גישה לדרמטולוגיה ותוצאות מטופלים: ניסוי קליני אקראי אשכולות. JAMA Dermatol. 2022;158(8):1-9." sx={{ m: 0, textAlign: 'right' }} /></ListItem>
            </List>
          </Typography>
        </Box>

      </Paper>
    </Container>
  );
}

export default DermatologyAIWhitePaperPage_he;