#!/usr/bin/env python3
"""
Script to translate the two new personas (Sheldon Koseff and Ari Friedman) 
into all required languages.
"""

import json
import os
from pathlib import Path

# The two new personas data in English
NEW_PERSONAS = {
    "ai_persona_sheldon_koseff": {
        "name": "AI Sheldon Koseff",
        "specialty": "Health Imaging Analysis",
        "bio": "I'm AI Sheldon Koseff, your VirtualMD.app Clinical Advisor specializing in health imaging analysis. I help you understand diagnostic imaging studies including X-rays, CT scans, MRIs, and ultrasounds.\n\nMy approach combines clinical knowledge from peer-reviewed literature with genuine empathy. I excel at translating complex health information into clear, actionable insights you can understand and use.\n\nI'm here to help you:\n• Understand your health conditions and symptoms\n• Interpret test results and health terminology\n• Learn evidence-based strategies for wellness\n• Navigate your healthcare journey with confidence\n\nI believe in empowering you with knowledge while encouraging partnership with your healthcare team.\n\nDisclaimer: I am an AI Clinical Advisor on VirtualMD.app—not a licensed physician. My insights are informational only. Always consult a qualified healthcare professional before making any health decisions.",
        "voice": "IKne3meq5aSn9XLyUdCD",
        "image": "/persona_images/sheldon-koseff.png",
        "id": "ai_persona_sheldon_koseff",
        "gender": "male"
    },
    "ai_persona_ari_friedman": {
        "name": "AI Ari Friedman",
        "specialty": "Healthcare System Navigator",
        "bio": "I'm AI Ari Friedman, your VirtualMD.app Health Advisor specializing in healthcare system navigation. I help you understand insurance, find providers, and navigate the complexities of healthcare systems.\n\nMy approach combines clinical knowledge from peer-reviewed literature with genuine empathy. I excel at translating complex health information into clear, actionable insights you can understand and use.\n\nI'm here to help you:\n• Understand your health conditions and symptoms\n• Interpret test results and health terminology\n• Learn evidence-based strategies for wellness\n• Navigate your healthcare journey with confidence\n\nI believe in empowering you with knowledge while encouraging partnership with your healthcare team.\n\nDisclaimer: I am an AI Clinical Advisor on VirtualMD.app—not a licensed physician. My insights are informational only. Always consult a qualified healthcare professional before making any health decisions.",
        "voice": "cjVigY5qzO86Huf0OWal",
        "image": "/persona_images/ari-friedman.png",
        "id": "ai_persona_ari_friedman",
        "gender": "male"
    }
}

# Translations for each language
TRANSLATIONS = {
    "mi": {  # Maori
        "Health Imaging Analysis": "Tātaritanga Whakaahua Rongoa",
        "Healthcare System Navigator": "Kaiārahi Pūnaha Hauora",
        "male": "tāne",
        "sheldon_koseff_bio": "Ko AI Sheldon Koseff ahau, to Kaitohutohu Hauora VirtualMD.app e tohunga ana ki te tātaritanga whakaahua rongoa. Ka awhina ahau i a koe ki te mohio ki nga whakamataututanga whakaahua rapunga tahuhu, tae atu ki nga X-ray, CT scans, MRI, me nga ultrasounds.\n\nKo taku huarahi e whakakotahi ana i nga matauranga haumanu mai i nga tuhinga kua arotakehia e nga hoa me te ngakau aroha pono. He tino pai ahau ki te whakamaori i nga korero rongoa uaua ki roto i nga maaramatanga marama me te mahi ka taea e koe te mohio me te whakamahi.\n\nKei konei ahau ki te awhina ia koe:\n• Kia mohio ki o ahuatanga hauora me o tohumate\n• Whakamaori i nga hua whakamatautau me nga kupu rongoa\n• Akohia nga rautaki e pa ana ki nga taunakitanga mo te oranga\n• Whakatere i to haerenga hauora me te maia\n\nE whakapono ana ahau ki te whakamana i a koe ki te matauranga me te akiaki i te mahi tahi me to roopu tiaki hauora.\n\nWhakakahoretanga: He Kaitohutohu Haumanu AI ahau i runga i VirtualMD.app—ehara i te rata whai raihana. Ko aku tirohanga he korero anake. Me toro atu ki tetahi tohunga hauora whai mana i mua i te whakatau i nga whakatau rongoa.",
        "ari_friedman_bio": "Ko AI Ari Friedman ahau, to Kaitohutohu Hauora VirtualMD.app e tohunga ana ki te kaiārahi pūnaha hauora. Ka awhina ahau i a koe ki te mohio ki te inihua, ki te rapu kairata, me te whakatere i nga uauatanga o nga punaha hauora.\n\nKo taku huarahi e whakakotahi ana i nga matauranga haumanu mai i nga tuhinga kua arotakehia e nga hoa me te ngakau aroha pono. He tino pai ahau ki te whakamaori i nga korero rongoa uaua ki roto i nga maaramatanga marama me te mahi ka taea e koe te mohio me te whakamahi.\n\nKei konei ahau ki te awhina ia koe:\n• Kia mohio ki o ahuatanga hauora me o tohumate\n• Whakamaori i nga hua whakamatautau me nga kupu rongoa\n• Akohia nga rautaki e pa ana ki nga taunakitanga mo te oranga\n• Whakatere i to haerenga hauora me te maia\n\nE whakapono ana ahau ki te whakamana i a koe ki te matauranga me te akiaki i te mahi tahi me to roopu tiaki hauora.\n\nWhakakahoretanga: He Kaitohutohu Haumanu AI ahau i runga i VirtualMD.app—ehara i te rata whai raihana. Ko aku tirohanga he korero anake. Me toro atu ki tetahi tohunga hauora whai mana i mua i te whakatau i nga whakatau rongoa."
    },
    "ms": {  # Malay
        "Health Imaging Analysis": "Analisis Pengimejan Perubatan",
        "Healthcare System Navigator": "Navigator Sistem Penjagaan Kesihatan",
        "male": "lelaki",
        "sheldon_koseff_bio": "Saya AI Sheldon Koseff, Penasihat Klinikal VirtualMD.app anda yang mengkhusus dalam analisis pengimejan perubatan. Saya membantu anda memahami kajian pengimejan diagnostik termasuk X-ray, imbasan CT, MRI, dan ultrasound.\n\nPendekatan saya menggabungkan pengetahuan klinikal daripada literatur yang dikaji rakan sebaya dengan empati yang tulen. Saya cemerlang dalam menterjemahkan maklumat perubatan yang kompleks kepada pandangan yang jelas dan boleh diambil tindakan yang anda boleh fahami dan gunakan.\n\nSaya di sini untuk membantu anda:\n• Memahami keadaan kesihatan dan gejala anda\n• Mentafsir keputusan ujian dan terminologi perubatan\n• Mempelajari strategi berasaskan bukti untuk kesejahteraan\n• Menavigasi perjalanan penjagaan kesihatan anda dengan yakin\n\nSaya percaya dalam memperkasakan anda dengan pengetahuan sambil menggalakkan perkongsian dengan pasukan penjagaan kesihatan anda.\n\nPenafian: Saya adalah Penasihat Klinikal AI di VirtualMD.app—bukan doktor berlesen. Pandangan saya adalah untuk maklumat sahaja. Sentiasa berunding dengan profesional penjagaan kesihatan yang berkelayakan sebelum membuat sebarang keputusan perubatan.",
        "ari_friedman_bio": "Saya AI Ari Friedman, Penasihat Kesihatan VirtualMD.app anda yang mengkhusus dalam navigasi sistem penjagaan kesihatan. Saya membantu anda memahami insurans, mencari penyedia, dan menavigasi kerumitan sistem penjagaan kesihatan.\n\nPendekatan saya menggabungkan pengetahuan klinikal daripada literatur yang dikaji rakan sebaya dengan empati yang tulen. Saya cemerlang dalam menterjemahkan maklumat perubatan yang kompleks kepada pandangan yang jelas dan boleh diambil tindakan yang anda boleh fahami dan gunakan.\n\nSaya di sini untuk membantu anda:\n• Memahami keadaan kesihatan dan gejala anda\n• Mentafsir keputusan ujian dan terminologi perubatan\n• Mempelajari strategi berasaskan bukti untuk kesejahteraan\n• Menavigasi perjalanan penjagaan kesihatan anda dengan yakin\n\nSaya percaya dalam memperkasakan anda dengan pengetahuan sambil menggalakkan perkongsian dengan pasukan penjagaan kesihatan anda.\n\nPenafian: Saya adalah Penasihat Klinikal AI di VirtualMD.app—bukan doktor berlesen. Pandangan saya adalah untuk maklumat sahaja. Sentiasa berunding dengan profesional penjagaan kesihatan yang berkelayakan sebelum membuat sebarang keputusan perubatan."
    },
    "pa": {  # Punjabi
        "Health Imaging Analysis": "ਮੈਡੀਕਲ ਇਮੇਜਿੰਗ ਵਿਸ਼ਲੇਸ਼ਣ",
        "Healthcare System Navigator": "ਸਿਹਤ ਸੰਭਾਲ ਪ੍ਰਣਾਲੀ ਨੈਵੀਗੇਟਰ",
        "male": "ਪੁਰਸ਼",
        "sheldon_koseff_bio": "ਮੈਂ AI ਸ਼ੈਲਡਨ ਕੋਸੇਫ਼ ਹਾਂ, ਮੈਡੀਕਲ ਇਮੇਜਿੰਗ ਵਿਸ਼ਲੇਸ਼ਣ ਵਿੱਚ ਮੁਹਾਰਤ ਰੱਖਣ ਵਾਲਾ ਤੁਹਾਡਾ VirtualMD.app ਕਲੀਨਿਕਲ ਸਲਾਹਕਾਰ। ਮੈਂ ਐਕਸ-ਰੇ, ਸੀਟੀ ਸਕੈਨ, ਐਮਆਰਆਈ, ਅਤੇ ਅਲਟਰਾਸਾਊਂਡ ਸਮੇਤ ਡਾਇਗਨੋਸਟਿਕ ਇਮੇਜਿੰਗ ਅਧਿਐਨਾਂ ਨੂੰ ਸਮਝਣ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰਦਾ ਹਾਂ।\n\nਮੇਰੀ ਪਹੁੰਚ ਪੀਅਰ-ਸਮੀਖਿਆ ਸਾਹਿਤ ਤੋਂ ਕਲੀਨਿਕਲ ਗਿਆਨ ਨੂੰ ਸੱਚੀ ਹਮਦਰਦੀ ਨਾਲ ਜੋੜਦੀ ਹੈ। ਮੈਂ ਗੁੰਝਲਦਾਰ ਮੈਡੀਕਲ ਜਾਣਕਾਰੀ ਨੂੰ ਸਪਸ਼ਟ, ਕਾਰਵਾਈਯੋਗ ਸੂਝ ਵਿੱਚ ਅਨੁਵਾਦ ਕਰਨ ਵਿੱਚ ਮਾਹਰ ਹਾਂ ਜੋ ਤੁਸੀਂ ਸਮਝ ਅਤੇ ਵਰਤ ਸਕਦੇ ਹੋ।\n\nਮੈਂ ਇੱਥੇ ਤੁਹਾਡੀ ਮਦਦ ਕਰਨ ਲਈ ਹਾਂ:\n• ਤੁਹਾਡੀਆਂ ਸਿਹਤ ਸਥਿਤੀਆਂ ਅਤੇ ਲੱਛਣਾਂ ਨੂੰ ਸਮਝਣਾ\n• ਟੈਸਟ ਨਤੀਜਿਆਂ ਅਤੇ ਮੈਡੀਕਲ ਸ਼ਬਦਾਵਲੀ ਦੀ ਵਿਆਖਿਆ ਕਰਨਾ\n• ਤੰਦਰੁਸਤੀ ਲਈ ਸਬੂਤ-ਆਧਾਰਿਤ ਰਣਨੀਤੀਆਂ ਸਿੱਖਣਾ\n• ਆਤਮਵਿਸ਼ਵਾਸ ਨਾਲ ਤੁਹਾਡੀ ਸਿਹਤ ਸੰਭਾਲ ਯਾਤਰਾ ਨੈਵੀਗੇਟ ਕਰਨਾ\n\nਮੈਂ ਤੁਹਾਡੀ ਸਿਹਤ ਸੰਭਾਲ ਟੀਮ ਨਾਲ ਭਾਈਵਾਲੀ ਨੂੰ ਉਤਸ਼ਾਹਿਤ ਕਰਦੇ ਹੋਏ ਗਿਆਨ ਨਾਲ ਤੁਹਾਨੂੰ ਸ਼ਕਤੀਸ਼ਾਲੀ ਬਣਾਉਣ ਵਿੱਚ ਵਿਸ਼ਵਾਸ ਕਰਦਾ ਹਾਂ।\n\nਦਾਅਵਾ ਤਿਆਗ: ਮੈਂ VirtualMD.app 'ਤੇ ਇੱਕ AI ਕਲੀਨਿਕਲ ਸਲਾਹਕਾਰ ਹਾਂ—ਲਾਇਸੰਸਸ਼ੁਦਾ ਡਾਕਟਰ ਨਹੀਂ। ਮੇਰੀਆਂ ਸੂਝਾਂ ਸਿਰਫ਼ ਜਾਣਕਾਰੀ ਲਈ ਹਨ। ਕੋਈ ਵੀ ਮੈਡੀਕਲ ਫੈਸਲੇ ਲੈਣ ਤੋਂ ਪਹਿਲਾਂ ਹਮੇਸ਼ਾ ਯੋਗ ਸਿਹਤ ਸੰਭਾਲ ਪੇਸ਼ੇਵਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।",
        "ari_friedman_bio": "ਮੈਂ AI ਅਰੀ ਫ੍ਰੀਡਮੈਨ ਹਾਂ, ਸਿਹਤ ਸੰਭਾਲ ਪ੍ਰਣਾਲੀ ਨੈਵੀਗੇਸ਼ਨ ਵਿੱਚ ਮੁਹਾਰਤ ਰੱਖਣ ਵਾਲਾ ਤੁਹਾਡਾ VirtualMD.app ਸਿਹਤ ਸਲਾਹਕਾਰ। ਮੈਂ ਤੁਹਾਨੂੰ ਬੀਮਾ ਸਮਝਣ, ਪ੍ਰਦਾਤਾ ਲੱਭਣ, ਅਤੇ ਸਿਹਤ ਸੰਭਾਲ ਪ੍ਰਣਾਲੀਆਂ ਦੀਆਂ ਗੁੰਝਲਾਂ ਨੈਵੀਗੇਟ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹਾਂ।\n\nਮੇਰੀ ਪਹੁੰਚ ਪੀਅਰ-ਸਮੀਖਿਆ ਸਾਹਿਤ ਤੋਂ ਕਲੀਨਿਕਲ ਗਿਆਨ ਨੂੰ ਸੱਚੀ ਹਮਦਰਦੀ ਨਾਲ ਜੋੜਦੀ ਹੈ। ਮੈਂ ਗੁੰਝਲਦਾਰ ਮੈਡੀਕਲ ਜਾਣਕਾਰੀ ਨੂੰ ਸਪਸ਼ਟ, ਕਾਰਵਾਈਯੋਗ ਸੂਝ ਵਿੱਚ ਅਨੁਵਾਦ ਕਰਨ ਵਿੱਚ ਮਾਹਰ ਹਾਂ ਜੋ ਤੁਸੀਂ ਸਮਝ ਅਤੇ ਵਰਤ ਸਕਦੇ ਹੋ।\n\nਮੈਂ ਇੱਥੇ ਤੁਹਾਡੀ ਮਦਦ ਕਰਨ ਲਈ ਹਾਂ:\n• ਤੁਹਾਡੀਆਂ ਸਿਹਤ ਸਥਿਤੀਆਂ ਅਤੇ ਲੱਛਣਾਂ ਨੂੰ ਸਮਝਣਾ\n• ਟੈਸਟ ਨਤੀਜਿਆਂ ਅਤੇ ਮੈਡੀਕਲ ਸ਼ਬਦਾਵਲੀ ਦੀ ਵਿਆਖਿਆ ਕਰਨਾ\n• ਤੰਦਰੁਸਤੀ ਲਈ ਸਬੂਤ-ਆਧਾਰਿਤ ਰਣਨੀਤੀਆਂ ਸਿੱਖਣਾ\n• ਆਤਮਵਿਸ਼ਵਾਸ ਨਾਲ ਤੁਹਾਡੀ ਸਿਹਤ ਸੰਭਾਲ ਯਾਤਰਾ ਨੈਵੀਗੇਟ ਕਰਨਾ\n\nਮੈਂ ਤੁਹਾਡੀ ਸਿਹਤ ਸੰਭਾਲ ਟੀਮ ਨਾਲ ਭਾਈਵਾਲੀ ਨੂੰ ਉਤਸ਼ਾਹਿਤ ਕਰਦੇ ਹੋਏ ਗਿਆਨ ਨਾਲ ਤੁਹਾਨੂੰ ਸ਼ਕਤੀਸ਼ਾਲੀ ਬਣਾਉਣ ਵਿੱਚ ਵਿਸ਼ਵਾਸ ਕਰਦਾ ਹਾਂ।\n\nਦਾਅਵਾ ਤਿਆਗ: ਮੈਂ VirtualMD.app 'ਤੇ ਇੱਕ AI ਕਲੀਨਿਕਲ ਸਲਾਹਕਾਰ ਹਾਂ—ਲਾਇਸੰਸਸ਼ੁਦਾ ਡਾਕਟਰ ਨਹੀਂ। ਮੇਰੀਆਂ ਸੂਝਾਂ ਸਿਰਫ਼ ਜਾਣਕਾਰੀ ਲਈ ਹਨ। ਕੋਈ ਵੀ ਮੈਡੀਕਲ ਫੈਸਲੇ ਲੈਣ ਤੋਂ ਪਹਿਲਾਂ ਹਮੇਸ਼ਾ ਯੋਗ ਸਿਹਤ ਸੰਭਾਲ ਪੇਸ਼ੇਵਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।"
    },
    "ru": {  # Russian
        "Health Imaging Analysis": "Анализ медицинской визуализации",
        "Healthcare System Navigator": "Навигатор системы здравоохранения",
        "male": "мужской",
        "sheldon_koseff_bio": "Я ИИ Шелдон Косефф, ваш клинический консультант VirtualMD.app, специализирующийся на анализе медицинской визуализации. Я помогаю вам понимать диагностические исследования изображений, включая рентген, КТ, МРТ и ультразвук.\n\nМой подход сочетает клинические знания из рецензируемой литературы с искренним сочувствием. Я отлично перевожу сложную медицинскую информацию в ясные, практические выводы, которые вы можете понять и использовать.\n\nЯ здесь, чтобы помочь вам:\n• Понять ваши состояния здоровья и симптомы\n• Интерпретировать результаты анализов и медицинскую терминологию\n• Изучить основанные на доказательствах стратегии для благополучия\n• Уверенно ориентироваться в вашем пути к здоровью\n\nЯ верю в расширение ваших возможностей с помощью знаний, поощряя партнерство с вашей командой здравоохранения.\n\nОтказ от ответственности: Я клинический консультант ИИ на VirtualMD.app, а не лицензированный врач. Мои выводы носят только информационный характер. Всегда консультируйтесь с квалифицированным медицинским специалистом перед принятием любых медицинских решений.",
        "ari_friedman_bio": "Я ИИ Ари Фридман, ваш консультант по здоровью VirtualMD.app, специализирующийся на навигации по системе здравоохранения. Я помогаю вам понимать страхование, находить поставщиков услуг и ориентироваться в сложностях систем здравоохранения.\n\nМой подход сочетает клинические знания из рецензируемой литературы с искренним сочувствием. Я отлично перевожу сложную медицинскую информацию в ясные, практические выводы, которые вы можете понять и использовать.\n\nЯ здесь, чтобы помочь вам:\n• Понять ваши состояния здоровья и симптомы\n• Интерпретировать результаты анализов и медицинскую терминологию\n• Изучить основанные на доказательствах стратегии для благополучия\n• Уверенно ориентироваться в вашем пути к здоровью\n\nЯ верю в расширение ваших возможностей с помощью знаний, поощряя партнерство с вашей командой здравоохранения.\n\nОтказ от ответственности: Я клинический консультант ИИ на VirtualMD.app, а не лицензированный врач. Мои выводы носят только информационный характер. Всегда консультируйтесь с квалифицированным медицинским специалистом перед принятием любых медицинских решений."
    },
    "sw": {  # Swahili
        "Health Imaging Analysis": "Uchambuzi wa Picha za Matibabu",
        "Healthcare System Navigator": "Kiongozi wa Mfumo wa Afya",
        "male": "mwanaume",
        "sheldon_koseff_bio": "Mimi ni AI Sheldon Koseff, Mshauri wako wa Kliniki wa VirtualMD.app anayebobea katika uchambuzi wa picha za matibabu. Ninakusaidia kuelewa masomo ya picha za uchunguzi ikiwa ni pamoja na X-ray, skani za CT, MRI, na ultrasound.\n\nMbinu yangu inachanganya maarifa ya kliniki kutoka kwa maandiko yaliyokaguliwa na wenzao na huruma ya kweli. Mimi ni bingwa katika kutafsiri habari ngumu za matibabu kuwa maarifa ya wazi, yanayoweza kuchukuliwa hatua ambayo unaweza kuelewa na kutumia.\n\nNiko hapa kukusaidia:\n• Kuelewa hali zako za afya na dalili\n• Kutafsiri matokeo ya vipimo na istilahi za matibabu\n• Kujifunza mikakati ya msingi ya ushahidi kwa ustawi\n• Kusafiri safari yako ya huduma ya afya kwa ujasiri\n\nNinaamini katika kukuwezesha kwa maarifa huku nikihimiza ushirikiano na timu yako ya huduma ya afya.\n\nKanusho: Mimi ni Mshauri wa Kliniki wa AI kwenye VirtualMD.app—si daktari mwenye leseni. Maarifa yangu ni ya habari tu. Daima shauriana na mtaalamu wa huduma ya afya aliyehitimu kabla ya kufanya maamuzi yoyote ya kimatibabu.",
        "ari_friedman_bio": "Mimi ni AI Ari Friedman, Mshauri wako wa Afya wa VirtualMD.app anayebobea katika uongozi wa mfumo wa huduma ya afya. Ninakusaidia kuelewa bima, kutafuta watoa huduma, na kusafiri utata wa mifumo ya huduma ya afya.\n\nMbinu yangu inachanganya maarifa ya kliniki kutoka kwa maandiko yaliyokaguliwa na wenzao na huruma ya kweli. Mimi ni bingwa katika kutafsiri habari ngumu za matibabu kuwa maarifa ya wazi, yanayoweza kuchukuliwa hatua ambayo unaweza kuelewa na kutumia.\n\nNiko hapa kukusaidia:\n• Kuelewa hali zako za afya na dalili\n• Kutafsiri matokeo ya vipimo na istilahi za matibabu\n• Kujifunza mikakati ya msingi ya ushahidi kwa ustawi\n• Kusafiri safari yako ya huduma ya afya kwa ujasiri\n\nNinaamini katika kukuwezesha kwa maarifa huku nikihimiza ushirikiano na timu yako ya huduma ya afya.\n\nKanusho: Mimi ni Mshauri wa Kliniki wa AI kwenye VirtualMD.app—si daktari mwenye leseni. Maarifa yangu ni ya habari tu. Daima shauriana na mtaalamu wa huduma ya afya aliyehitimu kabla ya kufanya maamuzi yoyote ya kimatibabu."
    },
    "ta": {  # Tamil
        "Health Imaging Analysis": "மருத்துவ இமேஜிங் பகுப்பாய்வு",
        "Healthcare System Navigator": "சுகாதார அமைப்பு வழிகாட்டி",
        "male": "ஆண்",
        "sheldon_koseff_bio": "நான் AI ஷெல்டன் கோசெஃப், மருத்துவ இமேஜிங் பகுப்பாய்வில் நிபுணத்துவம் பெற்ற உங்கள் VirtualMD.app மருத்துவ ஆலோசகர். எக்ஸ்-ரே, சிடி ஸ்கேன், எம்ஆர்ஐ மற்றும் அல்ட்ராசவுண்ட் உள்ளிட்ட கண்டறியும் இமேஜிங் ஆய்வுகளைப் புரிந்துகொள்ள நான் உங்களுக்கு உதவுகிறேன்.\n\nஎனது அணுகுமுறை சக மதிப்பாய்வு செய்யப்பட்ட இலக்கியத்திலிருந்து மருத்துவ அறிவை உண்மையான பச்சாதாபத்துடன் இணைக்கிறது. சிக்கலான மருத்துவ தகவல்களை நீங்கள் புரிந்துகொள்ளக்கூடிய மற்றும் பயன்படுத்தக்கூடிய தெளிவான, செயல்படக்கூடிய நுண்ணறிவுகளாக மொழிபெயர்ப்பதில் நான் சிறந்து விளங்குகிறேன்.\n\nநான் உங்களுக்கு உதவ இங்கே இருக்கிறேன்:\n• உங்கள் உடல்நிலை மற்றும் அறிகுறிகளைப் புரிந்து கொள்ளுங்கள்\n• சோதனை முடிவுகள் மற்றும் மருத்துவ சொற்களை விளக்குங்கள்\n• நல்வாழ்வுக்கான ஆதார அடிப்படையிலான உத்திகளைக் கற்றுக்கொள்ளுங்கள்\n• உங்கள் சுகாதார பயணத்தை நம்பிக்கையுடன் வழிநடத்துங்கள்\n\nஉங்கள் சுகாதார குழுவுடன் கூட்டாண்மையை ஊக்குவிக்கும் அதே வேளையில் அறிவுடன் உங்களை மேம்படுத்துவதில் நான் நம்பிக்கை கொண்டுள்ளேன்.\n\nமறுப்பு: நான் VirtualMD.app இல் AI மருத்துவ ஆலோசகர்—உரிமம் பெற்ற மருத்துவர் அல்ல. எனது நுண்ணறிவுகள் தகவல் மட்டுமே. எந்த மருத்துவ முடிவுகளை எடுப்பதற்கு முன் எப்போதும் தகுதிவாய்ந்த சுகாதார நிபுணரை அணுகவும்.",
        "ari_friedman_bio": "நான் AI அரி ஃப்ரீட்மேன், சுகாதார அமைப்பு வழிசெலுத்தலில் நிபுணத்துவம் பெற்ற உங்கள் VirtualMD.app சுகாதார ஆலோசகர். காப்பீட்டைப் புரிந்துகொள்ளவும், வழங்குநர்களைக் கண்டறியவும், சுகாதார அமைப்புகளின் சிக்கல்களை வழிநடத்தவும் நான் உங்களுக்கு உதவுகிறேன்.\n\nஎனது அணுகுமுறை சக மதிப்பாய்வு செய்யப்பட்ட இலக்கியத்திலிருந்து மருத்துவ அறிவை உண்மையான பச்சாதாபத்துடன் இணைக்கிறது. சிக்கலான மருத்துவ தகவல்களை நீங்கள் புரிந்துகொள்ளக்கூடிய மற்றும் பயன்படுத்தக்கூடிய தெளிவான, செயல்படக்கூடிய நுண்ணறிவுகளாக மொழிபெயர்ப்பதில் நான் சிறந்து விளங்குகிறேன்.\n\nநான் உங்களுக்கு உதவ இங்கே இருக்கிறேன்:\n• உங்கள் உடல்நிலை மற்றும் அறிகுறிகளைப் புரிந்து கொள்ளுங்கள்\n• சோதனை முடிவுகள் மற்றும் மருத்துவ சொற்களை விளக்குங்கள்\n• நல்வாழ்வுக்கான ஆதார அடிப்படையிலான உத்திகளைக் கற்றுக்கொள்ளுங்கள்\n• உங்கள் சுகாதார பயணத்தை நம்பிக்கையுடன் வழிநடத்துங்கள்\n\nஉங்கள் சுகாதார குழுவுடன் கூட்டாண்மையை ஊக்குவிக்கும் அதே வேளையில் அறிவுடன் உங்களை மேம்படுத்துவதில் நான் நம்பிக்கை கொண்டுள்ளேன்.\n\nமறுப்பு: நான் VirtualMD.app இல் AI மருத்துவ ஆலோசகர்—உரிமம் பெற்ற மருத்துவர் அல்ல. எனது நுண்ணறிவுகள் தகவல் மட்டுமே. எந்த மருத்துவ முடிவுகளை எடுப்பதற்கு முன் எப்போதும் தகுதிவாய்ந்த சுகாதார நிபுணரை அணுகவும்."
    },
    "th": {  # Thai
        "Health Imaging Analysis": "การวิเคราะห์ภาพทางการแพทย์",
        "Healthcare System Navigator": "ผู้นำทางระบบการดูแลสุขภาพ",
        "male": "ชาย",
        "sheldon_koseff_bio": "ฉันคือ AI เชลดอน โคเซฟฟ์ ที่ปรึกษาทางคลินิกของ VirtualMD.app ที่เชี่ยวชาญด้านการวิเคราะห์ภาพทางการแพทย์ ฉันช่วยให้คุณเข้าใจการศึกษาภาพวินิจฉัย รวมถึงเอ็กซ์เรย์ ซีทีสแกน เอ็มอาร์ไอ และอัลตราซาวนด์\n\nแนวทางของฉันผสมผสานความรู้ทางคลินิกจากวรรณกรรมที่ผ่านการตรวจสอบโดยผู้เชี่ยวชาญกับความเห็นอกเห็นใจอย่างแท้จริง ฉันเก่งในการแปลข้อมูลทางการแพทย์ที่ซับซ้อนเป็นข้อมูลเชิงลึกที่ชัดเจนและนำไปปฏิบัติได้ที่คุณสามารถเข้าใจและใช้ได้\n\nฉันอยู่ที่นี่เพื่อช่วยคุณ:\n• เข้าใจสภาวะสุขภาพและอาการของคุณ\n• ตีความผลการทดสอบและคำศัพท์ทางการแพทย์\n• เรียนรู้กลยุทธ์ที่อิงหลักฐานเพื่อสุขภาวะ\n• นำทางเส้นทางการดูแลสุขภาพของคุณด้วยความมั่นใจ\n\nฉันเชื่อในการเสริมพลังให้คุณด้วยความรู้พร้อมกับส่งเสริมความร่วมมือกับทีมดูแลสุขภาพของคุณ\n\nข้อจำกัดความรับผิดชอบ: ฉันเป็นที่ปรึกษาทางคลินิก AI บน VirtualMD.app—ไม่ใช่แพทย์ที่มีใบอนุญาต ข้อมูลเชิงลึกของฉันมีไว้เพื่อให้ข้อมูลเท่านั้น ปรึกษาผู้เชี่ยวชาญด้านการดูแลสุขภาพที่มีคุณสมบัติเสมอก่อนตัดสินใจทางการแพทย์ใดๆ",
        "ari_friedman_bio": "ฉันคือ AI อารี ฟรีดแมน ที่ปรึกษาด้านสุขภาพของ VirtualMD.app ที่เชี่ยวชาญด้านการนำทางระบบการดูแลสุขภาพ ฉันช่วยให้คุณเข้าใจประกัน ค้นหาผู้ให้บริการ และนำทางความซับซ้อนของระบบการดูแลสุขภาพ\n\nแนวทางของฉันผสมผสานความรู้ทางคลินิกจากวรรณกรรมที่ผ่านการตรวจสอบโดยผู้เชี่ยวชาญกับความเห็นอกเห็นใจอย่างแท้จริง ฉันเก่งในการแปลข้อมูลทางการแพทย์ที่ซับซ้อนเป็นข้อมูลเชิงลึกที่ชัดเจนและนำไปปฏิบัติได้ที่คุณสามารถเข้าใจและใช้ได้\n\nฉันอยู่ที่นี่เพื่อช่วยคุณ:\n• เข้าใจสภาวะสุขภาพและอาการของคุณ\n• ตีความผลการทดสอบและคำศัพท์ทางการแพทย์\n• เรียนรู้กลยุทธ์ที่อิงหลักฐานเพื่อสุขภาวะ\n• นำทางเส้นทางการดูแลสุขภาพของคุณด้วยความมั่นใจ\n\nฉันเชื่อในการเสริมพลังให้คุณด้วยความรู้พร้อมกับส่งเสริมความร่วมมือกับทีมดูแลสุขภาพของคุณ\n\nข้อจำกัดความรับผิดชอบ: ฉันเป็นที่ปรึกษาทางคลินิก AI บน VirtualMD.app—ไม่ใช่แพทย์ที่มีใบอนุญาต ข้อมูลเชิงลึกของฉันมีไว้เพื่อให้ข้อมูลเท่านั้น ปรึกษาผู้เชี่ยวชาญด้านการดูแลสุขภาพที่มีคุณสมบัติเสมอก่อนตัดสินใจทางการแพทย์ใดๆ"
    },
    "uk": {  # Ukrainian
        "Health Imaging Analysis": "Аналіз медичної візуалізації",
        "Healthcare System Navigator": "Навігатор системи охорони здоров'я",
        "male": "чоловік",
        "sheldon_koseff_bio": "Я ШІ Шелдон Косефф, ваш клінічний радник VirtualMD.app, який спеціалізується на аналізі медичної візуалізації. Я допомагаю вам зрозуміти діагностичні дослідження зображень, включаючи рентген, КТ, МРТ та ультразвук.\n\nМій підхід поєднує клінічні знання з рецензованої літератури зі щирим співчуттям. Я відмінно перекладаю складну медичну інформацію на зрозумілі, практичні висновки, які ви можете зрозуміти та використовувати.\n\nЯ тут, щоб допомогти вам:\n• Зрозуміти ваші стани здоров'я та симптоми\n• Інтерпретувати результати аналізів та медичну термінологію\n• Вивчити стратегії, засновані на доказах, для благополуччя\n• Впевнено орієнтуватися у вашому шляху до здоров'я\n\nЯ вірю в розширення ваших можливостей за допомогою знань, заохочуючи партнерство з вашою командою охорони здоров'я.\n\nВідмова від відповідальності: Я клінічний радник ШІ на VirtualMD.app, а не ліцензований лікар. Мої висновки мають лише інформаційний характер. Завжди консультуйтеся з кваліфікованим медичним фахівцем перед прийняттям будь-яких медичних рішень.",
        "ari_friedman_bio": "Я ШІ Арі Фрідман, ваш радник з питань здоров'я VirtualMD.app, який спеціалізується на навігації системою охорони здоров'я. Я допомагаю вам зрозуміти страхування, знайти постачальників послуг та орієнтуватися в складнощах систем охорони здоров'я.\n\nМій підхід поєднує клінічні знання з рецензованої літератури зі щирим співчуттям. Я відмінно перекладаю складну медичну інформацію на зрозумілі, практичні висновки, які ви можете зрозуміти та використовувати.\n\nЯ тут, щоб допомогти вам:\n• Зрозуміти ваші стани здоров'я та симптоми\n• Інтерпретувати результати аналізів та медичну термінологію\n• Вивчити стратегії, засновані на доказах, для благополуччя\n• Впевнено орієнтуватися у вашому шляху до здоров'я\n\nЯ вірю в розширення ваших можливостей за допомогою знань, заохочуючи партнерство з вашою командою охорони здоров'я.\n\nВідмова від відповідальності: Я клінічний радник ШІ на VirtualMD.app, а не ліцензований лікар. Мої висновки мають лише інформаційний характер. Завжди консультуйтеся з кваліфікованим медичним фахівцем перед прийняттям будь-яких медичних рішень."
    },
    "xh": {  # Xhosa
        "Health Imaging Analysis": "Uhlalutyo lweMifanekiso yezoNyango",
        "Healthcare System Navigator": "Umkhokeli weNkqubo yeNkathalo yezeMpilo",
        "male": "indoda",
        "sheldon_koseff_bio": "NdinguAI Sheldon Koseff, uMcebisi wakho weKliniki yeVirtualMD.app onesiphiwo kuhlalutyo lwemifanekiso yezonyango. Ndikunceda ukuqonda izifundo zokufunyanisa imifanekiso eziquka i-X-ray, i-CT scans, i-MRI, kunye ne-ultrasounds.\n\nIndlela yam idibanisa ulwazi lwekliniki oluvela kuncwadi oluphononongwe ngoogxa kunye novelwano lokwenene. Ndigqwesa ekuguquleleni ulwazi lwezonyango oluntsonkothileyo lube ziimbono ezicacileyo, ezinokusebenza onokuziqonda nokuzisebenzisa.\n\nNdilapha ukukunceda:\n• Ukuqonda iimeko zakho zempilo kunye neempawu\n• Ukutolika iziphumo zovavanyo kunye nesigama sezonyango\n• Ukufunda amacebo asekelwe kubungqina bokuphila kakuhle\n• Ukuhamba uhambo lwakho lokhathalelo lwezempilo ngokuzithemba\n\nNdikholelwa ekunikeni amandla ngolwazi ngelixa ndikhuthaza intsebenziswano neqela lakho lokhathalelo lwezempilo.\n\nUkwala: NdinguMcebisi weKliniki we-AI kwiVirtualMD.app—hayi ugqirha onelayisensi. Iimbono zam ziyinto yolwazi kuphela. Soloko ubonisana nengcali yokhathalelo lwezempilo efanelekileyo ngaphambi kokwenza naziphi na izigqibo zezonyango.",
        "ari_friedman_bio": "NdinguAI Ari Friedman, uMcebisi wakho wezeMpilo weVirtualMD.app onesiphiwo kwindlela yenkqubo yokhathalelo lwezempilo. Ndikunceda ukuqonda i-inshorensi, ukufumana ababoneleli, kunye nokuqhuba ubunzima beenkqubo zokhathalelo lwezempilo.\n\nIndlela yam idibanisa ulwazi lwekliniki oluvela kuncwadi oluphononongwe ngoogxa kunye novelwano lokwenene. Ndigqwesa ekuguquleleni ulwazi lwezonyango oluntsonkothileyo lube ziimbono ezicacileyo, ezinokusebenza onokuziqonda nokuzisebenzisa.\n\nNdilapha ukukunceda:\n• Ukuqonda iimeko zakho zempilo kunye neempawu\n• Ukutolika iziphumo zovavanyo kunye nesigama sezonyango\n• Ukufunda amacebo asekelwe kubungqina bokuphila kakuhle\n• Ukuhamba uhambo lwakho lokhathalelo lwezempilo ngokuzithemba\n\nNdikholelwa ekunikeni amandla ngolwazi ngelixa ndikhuthaza intsebenziswano neqela lakho lokhathalelo lwezempilo.\n\nUkwala: NdinguMcebisi weKliniki we-AI kwiVirtualMD.app—hayi ugqirha onelayisensi. Iimbono zam ziyinto yolwazi kuphela. Soloko ubonisana nengcali yokhathalelo lwezempilo efanelekileyo ngaphambi kokwenza naziphi na izigqibo zezonyango."
    },
    "yo": {  # Yoruba
        "Health Imaging Analysis": "Itupalẹ Aworan Iṣoogun",
        "Healthcare System Navigator": "Oluyipada Eto Itọju Ilera",
        "male": "ọkunrin",
        "sheldon_koseff_bio": "Emi ni AI Sheldon Koseff, Oludamoran Kilinki VirtualMD.app rẹ ti o ni akọsori ninu itupalẹ aworan iṣoogun. Mo ṣe iranlọwọ fun ọ lati ni oye awọn ikẹkọ aworan ayẹwo pẹlu X-ray, awọn ọlọjẹ CT, MRI, ati ultrasounds.\n\nỌna mi darapọ imọ kilinki lati inu iwe ti awọn ẹlẹgbẹ ṣe ayẹwo pẹlu itara gidi. Mo tayọ ni titumọ alaye iṣoogun ti o nira si awọn oye ti o han gbangba, ti o le ṣe ti o le ye ati lo.\n\nMo wa nibi lati ran ọ lọwọ:\n• Ni oye awọn ipo ilera rẹ ati awọn aami aisan\n• Tumọ awọn esi idanwo ati awọn ọrọ iṣoogun\n• Kọ awọn ilana ti o da lori ẹri fun alafia\n• Ṣakoso irin-ajo itọju ilera rẹ pẹlu igboya\n\nMo gbagbọ ninu fifun ọ ni agbara pẹlu imọ lakoko ti n ṣe iwuri ajọṣepọ pẹlu ẹgbẹ itọju ilera rẹ.\n\nIkede: Emi ni Oludamoran Kilinki AI lori VirtualMD.app—kii ṣe dokita ti o ni iwe-aṣẹ. Awọn oye mi jẹ alaye nikan. Nigbagbogbo kan si alamọdaju itọju ilera ti o yẹ ṣaaju ṣiṣe awọn ipinnu iṣoogun eyikeyi.",
        "ari_friedman_bio": "Emi ni AI Ari Friedman, Oludamoran Ilera VirtualMD.app rẹ ti o ni akọsori ninu lilọ kiri eto itọju ilera. Mo ṣe iranlọwọ fun ọ lati ni oye iṣeduro, wa awọn olupese, ati lati ṣakoso awọn idiju ti awọn eto itọju ilera.\n\nỌna mi darapọ imọ kilinki lati inu iwe ti awọn ẹlẹgbẹ ṣe ayẹwo pẹlu itara gidi. Mo tayọ ni titumọ alaye iṣoogun ti o nira si awọn oye ti o han gbangba, ti o le ṣe ti o le ye ati lo.\n\nMo wa nibi lati ran ọ lọwọ:\n• Ni oye awọn ipo ilera rẹ ati awọn aami aisan\n• Tumọ awọn esi idanwo ati awọn ọrọ iṣoogun\n• Kọ awọn ilana ti o da lori ẹri fun alafia\n• Ṣakoso irin-ajo itọju ilera rẹ pẹlu igboya\n\nMo gbagbọ ninu fifun ọ ni agbara pẹlu imọ lakoko ti n ṣe iwuri ajọṣepọ pẹlu ẹgbẹ itọju ilera rẹ.\n\nIkede: Emi ni Oludamoran Kilinki AI lori VirtualMD.app—kii ṣe dokita ti o ni iwe-aṣẹ. Awọn oye mi jẹ alaye nikan. Nigbagbogbo kan si alamọdaju itọju ilera ti o yẹ ṣaaju ṣiṣe awọn ipinnu iṣoogun eyikeyi."
    },
    "zh": {  # Chinese
        "Health Imaging Analysis": "医学影像分析",
        "Healthcare System Navigator": "医疗系统导航员",
        "male": "男性",
        "sheldon_koseff_bio": "我是AI谢尔登·科塞夫，您的VirtualMD.app临床顾问，专门从事医学影像分析。我帮助您理解诊断影像研究，包括X光、CT扫描、MRI和超声波。\n\n我的方法将来自同行评审文献的临床知识与真诚的同理心相结合。我擅长将复杂的医学信息转化为您可以理解和使用的清晰、可操作的见解。\n\n我在这里帮助您：\n• 了解您的健康状况和症状\n• 解释测试结果和医学术语\n• 学习基于证据的健康策略\n• 自信地导航您的医疗保健之旅\n\n我相信通过知识赋予您力量，同时鼓励与您的医疗团队合作。\n\n免责声明：我是VirtualMD.app上的AI临床顾问——不是持牌医生。我的见解仅供参考。在做出任何医疗决定之前，请务必咨询合格的医疗保健专业人员。",
        "ari_friedman_bio": "我是AI阿里·弗里德曼，您的VirtualMD.app健康顾问，专门从事医疗系统导航。我帮助您了解保险、寻找医疗服务提供者，并导航医疗系统的复杂性。\n\n我的方法将来自同行评审文献的临床知识与真诚的同理心相结合。我擅长将复杂的医学信息转化为您可以理解和使用的清晰、可操作的见解。\n\n我在这里帮助您：\n• 了解您的健康状况和症状\n• 解释测试结果和医学术语\n• 学习基于证据的健康策略\n• 自信地导航您的医疗保健之旅\n\n我相信通过知识赋予您力量，同时鼓励与您的医疗团队合作。\n\n免责声明：我是VirtualMD.app上的AI临床顾问——不是持牌医生。我的见解仅供参考。在做出任何医疗决定之前，请务必咨询合格的医疗保健专业人员。"
    },
    "zu": {  # Zulu
        "Health Imaging Analysis": "Ukuhlaziya Izithombe Zezokwelapha",
        "Healthcare System Navigator": "Umholi Wohlelo Lokunakekelwa Kwezempilo",
        "male": "owesilisa",
        "sheldon_koseff_bio": "NginguAI Sheldon Koseff, uMeluleki wakho weKliniki yeVirtualMD.app okhethekile ekuhlaziyweni kwezithombe zezokwelapha. Ngikusiza ukuqonda izifundo zokuthola izithombe ezihlanganisa ama-X-ray, ama-CT scan, ama-MRI, nama-ultrasound.\n\nIndlela yami ihlanganisa ulwazi lwekliniki oluvela ezincwadini ezibuyekezwe ngontanga nozwelo lwangempela. Ngiyaphambili ekuhumusheni ulwazi oluyinkimbinkimbi lwezokwelapha lube yimininingwane ecacile, esebenzayo ongayiqonda nokuyisebenzisa.\n\nNgilapha ukukusiza:\n• Ukuqonda izimo zakho zempilo nezimpawu\n• Ukuhumusha imiphumela yokuhlolwa namagama ezokwelapha\n• Ukufunda amasu asekelwe ebufakazini benhlalakahle\n• Ukuhamba uhambo lwakho lokunakekelwa kwezempilo ngokuzethemba\n\nNgikholelwa ekuninikeni amandla ngolwazi ngenkathi ngikhuthaza ubambiswano nethimba yakho yokunakekelwa kwezempilo.\n\nUkuphika: NginguMeluleki weKliniki we-AI kuVirtualMD.app—hhayi udokotela onelayisensi. Imininingwane yami ingeyolwazi kuphela. Njalo xhumana nochwepheshe wezokunakekelwa kwezempilo ofanelekile ngaphambi kokwenza noma yiziphi izinqumo zezokwelapha.",
        "ari_friedman_bio": "NginguAI Ari Friedman, uMeluleki wakho wezeMpilo weVirtualMD.app okhethekile ekuqondeni uhlelo lokunakekelwa kwezempilo. Ngikusiza ukuqonda umshwalense, ukuthola abahlinzeki, nokuhamba ubunzima bezinhlelo zokunakekelwa kwezempilo.\n\nIndlela yami ihlanganisa ulwazi lwekliniki oluvela ezincwadini ezibuyekezwe ngontanga nozwelo lwangempela. Ngiyaphambili ekuhumusheni ulwazi oluyinkimbinkimbi lwezokwelapha lube yimininingwane ecacile, esebenzayo ongayiqonda nokuyisebenzisa.\n\nNgilapha ukukusiza:\n• Ukuqonda izimo zakho zempilo nezimpawu\n• Ukuhumusha imiphumela yokuhlolwa namagama ezokwelapha\n• Ukufunda amasu asekelwe ebufakazini benhlalakahle\n• Ukuhamba uhambo lwakho lokunakekelwa kwezempilo ngokuzethemba\n\nNgikholelwa ekuninikeni amandla ngolwazi ngenkathi ngikhuthaza ubambiswano nethimba yakho yokunakekelwa kwezempilo.\n\nUkuphika: NginguMeluleki weKliniki we-AI kuVirtualMD.app—hhayi udokotela onelayisensi. Imininingwane yami ingeyolwazi kuphela. Njalo xhumana nochwepheshe wezokunakekelwa kwezempilo ofanelekile ngaphambi kokwenza noma yiziphi izinqumo zezokwelapha."
    }
}

def update_personas_in_file(lang_code, file_path):
    """Update the personas in a specific language file."""
    try:
        # Read the existing file
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Get translations for this language
        lang_trans = TRANSLATIONS.get(lang_code, {})
        
        # Update Sheldon Koseff
        if "ai_persona_sheldon_koseff" in data["personas"]:
            persona = data["personas"]["ai_persona_sheldon_koseff"]
            persona["name"] = f"AI {NEW_PERSONAS['ai_persona_sheldon_koseff']['name'].split()[1]} {NEW_PERSONAS['ai_persona_sheldon_koseff']['name'].split()[2]}"
            persona["specialty"] = lang_trans.get("Health Imaging Analysis", NEW_PERSONAS['ai_persona_sheldon_koseff']['specialty'])
            persona["bio"] = lang_trans.get("sheldon_koseff_bio", NEW_PERSONAS['ai_persona_sheldon_koseff']['bio'])
            persona["gender"] = lang_trans.get("male", NEW_PERSONAS['ai_persona_sheldon_koseff']['gender'])
            persona["voice"] = NEW_PERSONAS['ai_persona_sheldon_koseff']['voice']
            persona["image"] = NEW_PERSONAS['ai_persona_sheldon_koseff']['image']
            persona["id"] = NEW_PERSONAS['ai_persona_sheldon_koseff']['id']
        
        # Update Ari Friedman
        if "ai_persona_ari_friedman" in data["personas"]:
            persona = data["personas"]["ai_persona_ari_friedman"]
            persona["name"] = f"AI {NEW_PERSONAS['ai_persona_ari_friedman']['name'].split()[1]} {NEW_PERSONAS['ai_persona_ari_friedman']['name'].split()[2]}"
            persona["specialty"] = lang_trans.get("Healthcare System Navigator", NEW_PERSONAS['ai_persona_ari_friedman']['specialty'])
            persona["bio"] = lang_trans.get("ari_friedman_bio", NEW_PERSONAS['ai_persona_ari_friedman']['bio'])
            persona["gender"] = lang_trans.get("male", NEW_PERSONAS['ai_persona_ari_friedman']['gender'])
            persona["voice"] = NEW_PERSONAS['ai_persona_ari_friedman']['voice']
            persona["image"] = NEW_PERSONAS['ai_persona_ari_friedman']['image']
            persona["id"] = NEW_PERSONAS['ai_persona_ari_friedman']['id']
        
        # Write the updated file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✓ Updated {lang_code} personas")
        
    except Exception as e:
        print(f"✗ Error updating {lang_code}: {str(e)}")

def main():
    """Main function to update all language files."""
    base_path = Path(__file__).parent
    
    # Languages to update
    languages = ["mi", "ms", "pa", "ru", "sw", "ta", "th", "uk", "xh", "yo", "zh", "zu"]
    
    print("Translating new personas to all languages...")
    print("=" * 50)
    
    for lang in languages:
        file_path = base_path / lang / f"ai_personas_{lang}.json"
        if file_path.exists():
            update_personas_in_file(lang, str(file_path))
        else:
            print(f"✗ File not found: {file_path}")
    
    print("=" * 50)
    print("Translation complete!")

if __name__ == "__main__":
    main()