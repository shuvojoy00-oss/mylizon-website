# LizOn Student Search Foundation — Wave 1
Reviewed 2026-10-27. Draft planning data, NOT verified query volume.

## Source-backed changes and evidence
- IELTS Academic Reading officially contains 40 questions in 60 minutes with multiple task types: https://www.ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading
- IELTS Listening officially has 40 questions and distinct multiple choice/matching task types: https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening
- IELTS Academic Writing has two tasks and Speaking has three parts: https://www.ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test
- Pearson added Summarize Group Discussion and Respond to a Situation after 7 August 2025: https://www.pearsonpte.com/pte-updates-2025/
- Bangladesh study-abroad prospective students cite finances and scholarship access as key barriers in reporting from August 2026: https://bdnews24.com/bangladesh/81652510cbdd

## Existing route inventory — first checks
- /ieltsclass.html: free IELTS lesson interface, title and description present. Description claims '72 free IELTS video lessons'; verify count against live database before relying on it.
- /pteclass.html: free PTE lesson interface, metadata present; audit whether dynamic class titles and written notes are crawler-visible.
- /ielts-reading.html: older independent reading resource with canonical present; check if linked from active navigation and whether advice is current.
- /ielts-faq-bangladesh.html: existing FAQ, canonical uses bare mylizon.com although main website uses www.mylizon.com. Normalize.
- /sitemap.xml: only 8 listed URLs despite ~105 root HTML files. This is not automatically broken; classify files as active/retired/private before expanding sitemap.

## Student problem clusters and multilingual intent variants
All phrases below are HYPOTHESES to validate, not measured search frequencies.
| Cluster | English | বাংলা | Banglish |
|---|---|---|---|
| Reading headings | IELTS matching headings technique | আইইএলটিএস ম্যাচিং হেডিং কিভাবে করব | ielts matching headings kivabe korbo |
| Reading T/F/NG | IELTS true false not given difference | ট্রু ফলস নট গিভেন বুঝব কিভাবে | true false not given bujhbo kivabe |
| Reading speed | how to finish IELTS reading in 60 minutes | আইইএলটিএস রিডিং সময় কম পড়ে | ielts reading time kom pore |
| Listening maps | IELTS listening map labelling tips | লিসেনিং ম্যাপ লেবেলিং টিপস | listening map labelling tips bangla |
| Listening spelling | IELTS listening spelling mistakes | আইইএলটিএস লিসেনিং বানান ভুল | listening spelling vul hoy |
| Writing task 2 | how to improve task response IELTS | IELTS রাইটিং টাস্ক ২ ব্যান্ড বাড়াবো | writing task 2 band kivabe barabo |
| Task 1 | IELTS academic task 1 process diagram | আইইএলটিএস প্রসেস ডায়াগ্রাম | ielts process diagram kivabe likhbo |
| Speaking fluency | IELTS speaking pauses and fluency | স্পিকিং এ বার বার থেমে যাই | speaking e theme jai |
| PTE repeat sentence | PTE repeat sentence memory tips | পিটিই রিপিট সেন্টেন্স মনে থাকে না | pte repeat sentence mone thake na |
| PTE WFD | PTE write from dictation tips | পিটিই ডিকটেশন ভুল কমানোর উপায় | pte wfd vul hoy |
| PTE describe image | PTE describe image how to answer | পিটিই ডেসক্রাইব ইমেজ নিয়ম | describe image kivabe bolbo |
| PTE situation | PTE respond to a situation examples | পিটিই সিচুয়েশন টাস্ক উত্তর | respond to situation kivabe bolbo |
| PTE discussion | PTE summarize group discussion tips | পিটিই গ্রুপ ডিসকাশন সামারি | group discussion summary tips |
| Test choice | IELTS vs PTE for study abroad | আইইএলটিএস নাকি পিটিই | ielts naki pte |
| Scholarship | scholarships for Bangladeshi undergraduates | বাংলাদেশ থেকে স্কলারশিপ | scholarship kivabe pabo abroad |
| Budget | study abroad low budget Bangladesh | কম খরচে বিদেশে পড়াশোনা | kom budget e kon desh |
| Study gap | study abroad with 5 year gap | ৫ বছরের স্টাডি গ্যাপ | 5 years study gap possible |
| Visa finances | proof of funds student visa | স্টুডেন্ট ভিসার ব্যাংক স্টেটমেন্ট | visa bank statement koto taka |
| Passport | name mismatch passport student visa | পাসপোর্টে নাম ভুল ভিসা | passport name mismatch visa |
| Rejection | student visa refusal next steps | স্টুডেন্ট ভিসা রিজেক্ট হলে | visa reject hole ki korbo |

## Publishing rule
One canonical page per distinct user need; link neighboring variants in readable language, not hidden stuffing. Reuse current recorded classes; only publish original teaching examples and verified guidance. Scholarship and visa claims require official institution/government source checks, dated review, and human approval.

## Phase 1 action queue
P0: fix canonical mismatch of IELTS FAQ in staging; audit active lesson titles/notes and indexing.
P1: map current lesson IDs to clusters above; upgrade explanatory text for most useful lessons.
P1: measure actual search variants via Search Console and public search suggestions; label evidence and date.
P2: create verified standalone resources ONLY for gaps, preserve current UX.
