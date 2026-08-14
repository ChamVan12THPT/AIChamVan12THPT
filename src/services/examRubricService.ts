import { ExamRubric, DetailedRubricCriterion, EssayType, RubricSection } from '../types';
import { initialExamsRubrics } from '../data/mockData';

const RUBRICS_STORAGE_KEY = 'aichamvan_exam_rubrics_v2';

export const DEFAULT_TEACHER_CUSTOM_RULES = [
  'Không đánh giá thấp bài có cách diễn đạt sáng tạo, mang cá tính riêng.',
  'Không bắt buộc học sinh phải sử dụng đúng một dẫn chứng trong đáp án.',
  'Quan điểm cá nhân hợp lý, nhân văn phải được chấp nhận và khuyến khích.',
  'Không chấm theo đáp án cứng, linh hoạt đánh giá cấu trúc lập luận.',
  'Ưu tiên đánh giá mức độ đáp ứng đúng yêu cầu trọng tâm của đề bài.',
  'Khuyến khích học sinh có liên hệ thực tiễn xã hội sâu sắc và chân thành.',
  'Chú ý trừ điểm hợp lý đối với các lỗi chính tả, dùng từ và diễn đạt lủng củng.',
];

/**
 * Các mẫu Rubric tiêu chí chuẩn theo các loại bài trong chương trình GDPT 2018
 */
export const RUBRIC_PRESET_TEMPLATES: {
  id: string;
  name: string;
  essayType: EssayType;
  grade: '10' | '11' | '12' | 'THCS' | 'Khác';
  totalScore: number;
  description: string;
  criteria: DetailedRubricCriterion[];
}[] = [
  {
    id: 'preset-nlxh-200w',
    name: 'Mẫu Nghị luận xã hội (Đoạn văn 200 chữ - 2.0 điểm)',
    essayType: 'Nghị luận xã hội',
    grade: '12',
    totalScore: 2.0,
    description: 'Chuẩn đoạn văn 200 chữ theo cấu trúc thi Tốt nghiệp THPT 2025',
    criteria: [
      {
        id: 'crit-nlxh-1',
        name: 'Đảm bảo hình thức đoạn văn & dung lượng',
        description: 'Đúng cấu trúc đoạn văn (không xuống dòng tùy tiện), dung lượng khoảng 200 chữ.',
        maxScore: 0.25,
        aiGuidance: 'Chấp nhận dung lượng linh hoạt từ 180 đến 300 chữ nếu lập luận mạch lạc.',
        levels: [
          { score: 0.0, label: '0 điểm', description: 'Viết thành nhiều đoạn hoặc quá ngắn/quá dài nghiêm trọng.' },
          { score: 0.15, label: '0.15 điểm', description: 'Đúng 1 đoạn nhưng dung lượng quá dài (>350 chữ) hoặc hơi sơ sài.' },
          { score: 0.25, label: '0.25 điểm', description: 'Đúng hình thức 1 đoạn văn hoàn chỉnh, dung lượng chuẩn.' },
        ],
      },
      {
        id: 'crit-nlxh-2',
        name: 'Xác định đúng vấn đề nghị luận',
        description: 'Nêu trúng và sáng rõ vấn đề cần bàn luận theo yêu cầu của đề bài.',
        maxScore: 0.5,
        aiGuidance: 'Chỉ cần học sinh nêu đúng từ khóa trọng tâm, không bắt buộc trích nguyên văn câu chữ đề.',
        levels: [
          { score: 0.0, label: '0 điểm', description: 'Lạc đề hoàn toàn, không nhắc đến vấn đề nghị luận.' },
          { score: 0.25, label: '0.25 điểm', description: 'Xác định chưa đầy đủ hoặc mơ hồ về vấn đề nghị luận.' },
          { score: 0.5, label: '0.5 điểm', description: 'Xác định đúng và đầy đủ trọng tâm vấn đề nghị luận.' },
        ],
      },
      {
        id: 'crit-nlxh-3',
        name: 'Lập luận, dẫn chứng & Bàn luận mở rộng',
        description: 'Lý lẽ sắc bén, dẫn chứng người thật việc thật thuyết phục, có góc nhìn phản biện.',
        maxScore: 0.75,
        aiGuidance: 'Chấp nhận đa dạng các dẫn chứng thời sự, lịch sử, văn học hoặc trải nghiệm cá nhân.',
        levels: [
          { score: 0.1, label: '0.1 điểm', description: 'Không có dẫn chứng, lý lẽ sáo rỗng, rời rạc.' },
          { score: 0.25, label: '0.25 điểm', description: 'Lập luận sơ lược, dẫn chứng mơ hồ hoặc thiếu tính thời sự.' },
          { score: 0.5, label: '0.5 điểm', description: 'Lập luận tốt, có dẫn chứng phù hợp nhưng chưa đào sâu.' },
          { score: 0.75, label: '0.75 điểm', description: 'Lập luận sắc bén, dẫn chứng tiêu biểu, có sức thuyết phục cao.' },
        ],
      },
      {
        id: 'crit-nlxh-4',
        name: 'Chính tả, ngữ pháp & Sáng tạo diễn đạt',
        description: 'Không mắc lỗi chính tả, diễn đạt trong sáng, giàu hình ảnh, có tư duy sáng tạo.',
        maxScore: 0.5,
        aiGuidance: 'Khuyến khích cách dùng từ tinh tế, câu văn giàu nhịp điệu cảm xúc.',
        levels: [
          { score: 0.1, label: '0.1 điểm', description: 'Mắc nhiều lỗi chính tả, ngữ pháp làm sai lệch ý nghĩa.' },
          { score: 0.25, label: '0.25 điểm', description: 'Mắc 2-3 lỗi dùng từ, câu văn chưa thật trau chuốt.' },
          { score: 0.5, label: '0.5 điểm', description: 'Văn phong mạch lạc, đúng ngữ pháp, có phát hiện mới mẻ.' },
        ],
      },
    ],
  },
  {
    id: 'preset-nlvh-600w',
    name: 'Mẫu Nghị luận văn học (Bài văn 600 chữ - 4.0 điểm)',
    essayType: 'Nghị luận văn học',
    grade: '12',
    totalScore: 4.0,
    description: 'Chuẩn bài văn phân tích/cảm nhận tác phẩm văn học 600 chữ',
    criteria: [
      {
        id: 'crit-nlvh-1',
        name: 'Đảm bảo cấu trúc bài văn nghị luận (Mở - Thân - Kết)',
        description: 'Mở bài giới thiệu tác giả/tác phẩm, Thân bài giải quyết các luận điểm, Kết bài tổng kết.',
        maxScore: 0.25,
        aiGuidance: 'Đánh giá tính liền mạch và chuyển ý giữa các phần.',
        levels: [
          { score: 0.0, label: '0 điểm', description: 'Không đủ bố cục 3 phần hoặc viết dở dang.' },
          { score: 0.15, label: '0.15 điểm', description: 'Đủ 3 phần nhưng chuyển đoạn còn thô cứng.' },
          { score: 0.25, label: '0.25 điểm', description: 'Bố cục hoàn chỉnh, liên kết các phần chặt chẽ và tự nhiên.' },
        ],
      },
      {
        id: 'crit-nlvh-2',
        name: 'Phân tích nội dung hình tượng & Chi tiết nghệ thuật',
        description: 'Khai thác sâu sắc cảm xúc, tư tưởng, hình tượng nghệ thuật và bút pháp của tác giả.',
        maxScore: 2.5,
        aiGuidance: 'Linh hoạt chấp nhận các cảm nhận cá nhân có căn cứ từ văn bản.',
        levels: [
          { score: 0.5, label: '0.5 - 0.75đ', description: 'Kể lại tác phẩm, diễn xuôi văn bản, chưa biết phân tích.' },
          { score: 1.25, label: '1.0 - 1.5đ', description: 'Phân tích được một số nét cơ bản nhưng còn sơ lược.' },
          { score: 2.0, label: '1.75 - 2.0đ', description: 'Phân tích tương đối đầy đủ, có cảm thụ văn học khá tốt.' },
          { score: 2.5, label: '2.25 - 2.5đ', description: 'Phân tích thấu đáo, tinh tế cả nội dung và nghệ thuật, có chất văn.' },
        ],
      },
      {
        id: 'crit-nlvh-3',
        name: 'Đánh giá tư tưởng nhân văn & Phong cách tác giả',
        description: 'Khái quát đóng góp của tác phẩm, tư tưởng chủ đạo và phong cách độc đáo của tác giả.',
        maxScore: 0.5,
        aiGuidance: 'Đánh giá năng lực lý luận văn học và tầm nhìn bao quát của học sinh.',
        levels: [
          { score: 0.0, label: '0 điểm', description: 'Bỏ qua không đánh giá hoặc đánh giá sai lệch.' },
          { score: 0.25, label: '0.25 điểm', description: 'Đánh giá sơ lược, công thức theo khuôn mẫu.' },
          { score: 0.5, label: '0.5 điểm', description: 'Đánh giá sâu sắc, có tư duy lý luận và góc nhìn riêng.' },
        ],
      },
      {
        id: 'crit-nlvh-4',
        name: 'Diễn đạt, chính tả, sáng tạo văn phong',
        description: 'Văn phong truyền cảm, giàu hình ảnh, dùng từ chính xác, có phát hiện mới mẻ.',
        maxScore: 0.75,
        aiGuidance: 'Cộng điểm khuyến khích cho học sinh có vốn từ phong phú, trích dẫn lý luận tự nhiên.',
        levels: [
          { score: 0.15, label: '0.15đ', description: 'Mắc nhiều lỗi ngữ pháp câu, lủng củng.' },
          { score: 0.45, label: '0.45đ', description: 'Diễn đạt trôi chảy, đúng chuẩn mực tiếng Việt.' },
          { score: 0.75, label: '0.75đ', description: 'Hành văn lôi cuốn, giàu cảm xúc, có dấu ấn phong cách cá nhân.' },
        ],
      },
    ],
  },
  {
    id: 'preset-dochieu-40',
    name: 'Mẫu Đọc hiểu văn bản (4 câu hỏi - 4.0 điểm)',
    essayType: 'Đọc hiểu',
    grade: '12',
    totalScore: 4.0,
    description: 'Khung ma trận 4 cấp độ: Nhận biết (1.0đ) - Thông hiểu (1.5đ) - Vận dụng (1.5đ)',
    criteria: [
      {
        id: 'crit-dh-nb',
        name: 'Câu 1 & 2: Nhận biết thể loại, phương thức, chi tiết văn bản',
        description: 'Chỉ ra chính xác các yếu tố hình thức hoặc thông tin trực tiếp từ ngữ liệu.',
        maxScore: 1.0,
        aiGuidance: 'Chấm đúng theo từ ngữ xuất hiện trong văn bản đọc hiểu.',
        levels: [
          { score: 0.0, label: '0 điểm', description: 'Trả lời sai hoặc không trả lời.' },
          { score: 0.5, label: '0.5 điểm', description: 'Trả lời đúng 1 trong 2 ý nhận biết.' },
          { score: 1.0, label: '1.0 điểm', description: 'Trả lời đúng hoàn toàn và chính xác cả 2 yêu cầu.' },
        ],
      },
      {
        id: 'crit-dh-th',
        name: 'Câu 3: Thông hiểu ý nghĩa hình ảnh / Thông điệp văn bản',
        description: 'Giải thích mạch lạc, chính xác tầng nghĩa biểu tượng hoặc thông điệp cốt lõi.',
        maxScore: 1.5,
        aiGuidance: 'Chấp nhận các cách diễn đạt tương đương nếu đúng bản chất tư tưởng.',
        levels: [
          { score: 0.25, label: '0.25đ', description: 'Hiểu mơ hồ, diễn đạt sơ sài hoặc suy diễn quá đà.' },
          { score: 0.75, label: '0.75đ', description: 'Giải thích đúng ý chính nhưng chưa thật sáng rõ.' },
          { score: 1.5, label: '1.5đ', description: 'Lý giải sâu sắc, thấu đáo, gắn kết chặt chẽ với ngữ liệu.' },
        ],
      },
      {
        id: 'crit-dh-vd',
        name: 'Câu 4: Vận dụng thực tiễn & Rút ra bài học nhân sinh',
        description: 'Rút ra bài học hành động/nhận thức có ý nghĩa tích cực, phù hợp đạo đức chuẩn mực.',
        maxScore: 1.5,
        aiGuidance: 'Đánh giá cao bài học thực tế, chân thành, tránh các câu sáo rỗng.',
        levels: [
          { score: 0.25, label: '0.25đ', description: 'Bài học sáo rỗng hoặc chưa phù hợp với văn cảnh.' },
          { score: 0.75, label: '0.75đ', description: 'Nêu được bài học đúng hướng nhưng còn khái quát.' },
          { score: 1.5, label: '1.5đ', description: 'Bài học sâu sắc, thuyết phục, có thái độ chân thành và giải pháp rõ ràng.' },
        ],
      },
    ],
  },
  {
    id: 'preset-thpt-2025-full-10',
    name: 'Mẫu Toàn diện Đề thi Tốt nghiệp THPT 2025 (Thang điểm 10.0)',
    essayType: 'Bài viết tổng hợp',
    grade: '12',
    totalScore: 10.0,
    description: 'Cấu trúc hoàn chỉnh 3 phần: I. Đọc hiểu (4.0đ) + II. NLXH (2.0đ) + III. NLVH (4.0đ)',
    criteria: [
      {
        id: 'crit-full-dh1',
        name: 'Phần I - Câu 1 & 2: Nhận biết trong Đọc hiểu',
        description: 'Nhận diện thể loại, phương thức biểu đạt và chi tiết văn bản.',
        maxScore: 1.0,
        levels: [
          { score: 0.0, label: '0 điểm', description: 'Sai hoặc không trả lời.' },
          { score: 0.5, label: '0.5đ', description: 'Đúng 1 phần yêu cầu nhận biết.' },
          { score: 1.0, label: '1.0đ', description: 'Đúng hoàn toàn và chính xác.' },
        ],
      },
      {
        id: 'crit-full-dh2',
        name: 'Phần I - Câu 3: Thông hiểu ý nghĩa & tư tưởng',
        description: 'Lý giải ý nghĩa hình ảnh và thông điệp của tác giả.',
        maxScore: 1.5,
        levels: [
          { score: 0.5, label: '0.5đ', description: 'Hiểu sơ sài.' },
          { score: 1.0, label: '1.0đ', description: 'Giải thích đúng ý cốt lõi.' },
          { score: 1.5, label: '1.5đ', description: 'Lý giải sâu sắc, sáng rõ.' },
        ],
      },
      {
        id: 'crit-full-dh3',
        name: 'Phần I - Câu 4: Vận dụng & Bài học nhân sinh',
        description: 'Bài học nhận thức và hành động rút ra từ ngữ liệu.',
        maxScore: 1.5,
        levels: [
          { score: 0.5, label: '0.5đ', description: 'Bài học chung chung.' },
          { score: 1.0, label: '1.0đ', description: 'Bài học đúng hướng.' },
          { score: 1.5, label: '1.5đ', description: 'Bài học sâu sắc, thuyết phục.' },
        ],
      },
      {
        id: 'crit-full-nlxh1',
        name: 'Phần II - NLXH: Hình thức đoạn văn & Vấn đề nghị luận',
        description: 'Đúng 1 đoạn văn ~200 chữ và xác định trúng vấn đề trọng tâm.',
        maxScore: 0.75,
        levels: [
          { score: 0.25, label: '0.25đ', description: 'Xác định chưa sát hoặc sai hình thức.' },
          { score: 0.5, label: '0.5đ', description: 'Đúng đoạn văn, nêu được vấn đề.' },
          { score: 0.75, label: '0.75đ', description: 'Đúng chuẩn hình thức đoạn, xác định trúng và sáng rõ.' },
        ],
      },
      {
        id: 'crit-full-nlxh2',
        name: 'Phần II - NLXH: Lập luận, dẫn chứng & Diễn đạt',
        description: 'Luận điểm rõ, dẫn chứng tiêu biểu, không mắc lỗi chính tả.',
        maxScore: 1.25,
        levels: [
          { score: 0.5, label: '0.5đ', description: 'Lập luận sơ lược, dẫn chứng mờ nhạt.' },
          { score: 0.85, label: '0.85đ', description: 'Lập luận tốt, có dẫn chứng thực tế.' },
          { score: 1.25, label: '1.25đ', description: 'Lập luận sắc bén, dẫn chứng thuyết phục, sáng tạo.' },
        ],
      },
      {
        id: 'crit-full-nlvh1',
        name: 'Phần III - NLVH: Cấu trúc bài văn & Xác định vấn đề',
        description: 'Đầy đủ Mở - Thân - Kết và xác định đúng đối tượng phân tích.',
        maxScore: 0.5,
        levels: [
          { score: 0.25, label: '0.25đ', description: 'Bố cục chưa trọn vẹn.' },
          { score: 0.5, label: '0.5đ', description: 'Bố cục hoàn chỉnh, liên kết mượt mà.' },
        ],
      },
      {
        id: 'crit-full-nlvh2',
        name: 'Phần III - NLVH: Phân tích nội dung & Nghệ thuật',
        description: 'Làm sáng tỏ giá trị tư tưởng và nét đặc sắc nghệ thuật của văn bản.',
        maxScore: 2.5,
        levels: [
          { score: 1.0, label: '1.0đ', description: 'Diễn xuôi nội dung, phân tích nông.' },
          { score: 1.75, label: '1.75đ', description: 'Phân tích tương đối đủ luận điểm.' },
          { score: 2.5, label: '2.5đ', description: 'Phân tích thấu đáo, giàu cảm xúc, có chất văn.' },
        ],
      },
      {
        id: 'crit-full-nlvh3',
        name: 'Phần III - NLVH: Đánh giá nâng cao, sáng tạo & Diễn đạt',
        description: 'Đánh giá phong cách tác giả, văn phong truyền cảm, sáng tạo.',
        maxScore: 1.0,
        levels: [
          { score: 0.25, label: '0.25đ', description: 'Đánh giá sơ lược, nhiều lỗi diễn đạt.' },
          { score: 0.65, label: '0.65đ', description: 'Đánh giá đúng, hành văn mạch lạc.' },
          { score: 1.0, label: '1.0đ', description: 'Đánh giá sâu sắc, hành văn lôi cuốn, sáng tạo.' },
        ],
      },
    ],
  },
];

/**
 * Service quản lý Đề thi và Rubric
 */
class ExamRubricService {
  /**
   * Chuyển đổi dữ liệu rubric ban đầu sang định dạng chuẩn đầy đủ nếu thiếu
   */
  private enrichRubricData(rubric: ExamRubric): ExamRubric {
    // Nếu chưa có criteriaList nhưng có sections, trích xuất criteriaList
    let criteriaList = rubric.criteriaList;
    if (!criteriaList && rubric.sections) {
      criteriaList = [];
      rubric.sections.forEach((sec) => {
        sec.criteria.forEach((c) => {
          criteriaList!.push({
            id: c.id,
            name: c.name,
            description: c.description,
            maxScore: c.maxScore,
            levels: [
              { score: 0, label: '0 điểm', description: c.scoringGuide.weak },
              { score: Number((c.maxScore * 0.4).toFixed(2)), label: 'Trung bình', description: c.scoringGuide.average },
              { score: Number((c.maxScore * 0.75).toFixed(2)), label: 'Khá', description: c.scoringGuide.good },
              { score: c.maxScore, label: 'Tối đa', description: c.scoringGuide.excellent },
            ],
            aiGuidance: `Đánh giá mức độ đáp ứng tiêu chí ${c.name}, linh hoạt điểm theo các mức trên.`,
          });
        });
      });
    }

    // Xác định essayType mặc định
    let essayType: EssayType = 'Bài viết tổng hợp';
    if (rubric.essayType) {
      essayType = rubric.essayType as EssayType;
    } else if (rubric.title.includes('Nghị luận xã hội') || rubric.title.includes('NLXH')) {
      essayType = 'Nghị luận xã hội';
    } else if (rubric.title.includes('Nghị luận văn học') || rubric.title.includes('NLVH')) {
      essayType = 'Nghị luận văn học';
    } else if (rubric.title.includes('Đọc hiểu')) {
      essayType = 'Đọc hiểu';
    }

    return {
      ...rubric,
      subject: rubric.subject || 'Ngữ văn',
      schoolYear: rubric.schoolYear || '2024 - 2025',
      essayType,
      content:
        rubric.content ||
        (rubric.readingPassage
          ? `${rubric.readingPassage}\n\n[Câu NLXH]: ${rubric.promptSocial || ''}\n\n[Câu NLVH]: ${rubric.promptLiterature || ''}`
          : 'Nội dung đề thi và yêu cầu chi tiết của bài viết.'),
      gradingGuide:
        rubric.gradingGuide ||
        'Yêu cầu học sinh nắm vững kiến thức ngữ văn, làm đúng thể thức đề bài, lập luận mạch lạc và có cảm thụ tinh tế.',
      criteriaList: criteriaList || [],
      teacherCustomRules: rubric.teacherCustomRules || [
        'Không đánh giá thấp bài có cách diễn đạt sáng tạo.',
        'Không bắt buộc học sinh phải sử dụng đúng một dẫn chứng.',
        'Quan điểm cá nhân hợp lý phải được chấp nhận.',
        'Không chấm theo đáp án cứng.',
        'Ưu tiên đánh giá mức độ đáp ứng yêu cầu của đề.',
      ],
      teacherCustomPrompt:
        rubric.teacherCustomPrompt ||
        'Lưu ý chấm linh hoạt với các bài viết có cách tiếp cận độc đáo nhưng lập luận chặt chẽ.',
      status: rubric.status || 'ready',
    };
  }

  public getRubrics(): ExamRubric[] {
    try {
      const stored = localStorage.getItem(RUBRICS_STORAGE_KEY);
      if (stored) {
        const parsed: ExamRubric[] = JSON.parse(stored);
        return parsed.map((r) => this.enrichRubricData(r));
      }
    } catch (e) {
      console.warn('Lỗi đọc rubrics từ LocalStorage:', e);
    }

    // Seed default enriched rubrics
    const initialEnriched = initialExamsRubrics.map((r) => this.enrichRubricData(r));

    // Thêm các đề mẫu bổ trợ nếu chỉ có 1 đề trong mock data
    if (initialEnriched.length === 1) {
      const sampleNlxh: ExamRubric = {
        id: 'exam-nlxh-mau-01',
        title: 'Đề Nghị luận xã hội: Bản lĩnh và lòng trắc ẩn của người trẻ',
        subject: 'Ngữ văn',
        grade: '12',
        schoolYear: '2024 - 2025',
        essayType: 'Nghị luận xã hội',
        type: 'Luyện đề chuyên sâu',
        timeLimitMinutes: 45,
        totalScore: 10.0,
        content: `Viết một bài văn nghị luận xã hội (khoảng 500 - 600 chữ) bàn về vấn đề: "Trong một thế giới đầy biến động và cạnh tranh, điều gì làm nên sức mạnh bền bỉ nhất của thế hệ trẻ: Bản lĩnh kiên cường hay lòng trắc ẩn hướng thiện?"`,
        gradingGuide: `1. Mở bài (1.0đ): Dẫn dắt và nêu rõ vấn đề nghị luận.
2. Giải thích & Luận điểm (3.0đ): Khái niệm bản lĩnh, lòng trắc ẩn và mối quan hệ biện chứng giữa chúng.
3. Bàn luận & Dẫn chứng (3.5đ): Chứng minh bằng dẫn chứng thực tế, phân tích tính hai mặt.
4. Phản đề & Bài học (1.5đ): Phê phán lối sống vô cảm, rút ra bài học nhận thức và hành động.
5. Kết bài (1.0đ): Khẳng định lại ý nghĩa và truyền cảm hứng.`,
        criteriaList: [
          {
            id: 'crit-nlxh-intro',
            name: 'Mở bài & Xác định vấn đề nghị luận',
            description: 'Giới thiệu vấn đề khéo léo, đúng trọng tâm đề bài.',
            maxScore: 1.0,
            aiGuidance: 'Chấp nhận mở bài trực tiếp hoặc gián tiếp.',
            levels: [
              { score: 0.0, label: '0đ', description: 'Không có mở bài hoặc lạc đề.' },
              { score: 0.5, label: '0.5đ', description: 'Mở bài sơ sài, nêu chưa rõ vấn đề.' },
              { score: 1.0, label: '1.0đ', description: 'Mở bài hấp dẫn, nêu trúng và sáng rõ vấn đề.' },
            ],
          },
          {
            id: 'crit-nlxh-explain',
            name: 'Giải thích & Xác lập hệ thống luận điểm',
            description: 'Giải thích rõ ràng các khái niệm then chốt, xác lập luận điểm mạch lạc.',
            maxScore: 2.0,
            aiGuidance: 'Đánh giá khả năng tư duy logic và định nghĩa khái niệm của học sinh.',
            levels: [
              { score: 0.5, label: '0.5đ', description: 'Giải thích mơ hồ, lẫn lộn các ý niệm.' },
              { score: 1.25, label: '1.25đ', description: 'Giải thích được các ý chính nhưng chưa thật sâu.' },
              { score: 2.0, label: '2.0đ', description: 'Giải thích chính xác, mạch lạc, làm rõ bản chất vấn đề.' },
            ],
          },
          {
            id: 'crit-nlxh-proof',
            name: 'Bàn luận, phân tích & Dẫn chứng thực tiễn',
            description: 'Lý lẽ sắc sảo, dẫn chứng người thật việc thật thời sự, lập luận thuyết phục.',
            maxScore: 3.5,
            aiGuidance: 'Không bắt buộc dùng dẫn chứng quen thuộc trong SGK; khuyến khích dẫn chứng mới.',
            levels: [
              { score: 1.0, label: '1.0đ', description: 'Lý lẽ chung chung, không có dẫn chứng hoặc dẫn chứng sai.' },
              { score: 2.25, label: '2.25đ', description: 'Có dẫn chứng nhưng phân tích chưa sâu.' },
              { score: 3.5, label: '3.5đ', description: 'Lập luận sắc bén, dẫn chứng tiêu biểu, phân tích thấu đáo.' },
            ],
          },
          {
            id: 'crit-nlxh-counter',
            name: 'Phản biện & Bài học nhận thức, hành động',
            description: 'Nhìn nhận vấn đề đa chiều, rút ra bài học thiết thực cho bản thân.',
            maxScore: 2.0,
            aiGuidance: 'Đánh giá tính chân thành và khả thi của bài học hành động.',
            levels: [
              { score: 0.5, label: '0.5đ', description: 'Bài học sáo rỗng, thiếu tính thực tế.' },
              { score: 1.25, label: '1.25đ', description: 'Có bài học nhưng chưa có chiều sâu phản biện.' },
              { score: 2.0, label: '2.0đ', description: 'Phản biện tinh tế, bài học cụ thể và ý nghĩa.' },
            ],
          },
          {
            id: 'crit-nlxh-style',
            name: 'Kết bài, chính tả & Sáng tạo diễn đạt',
            description: 'Kết bài ấn tượng, văn phong trong sáng, giàu hình ảnh, không lỗi chính tả.',
            maxScore: 1.5,
            aiGuidance: 'Khuyến khích cách viết giàu nhịp điệu cảm xúc.',
            levels: [
              { score: 0.5, label: '0.5đ', description: 'Mắc lỗi dùng từ, câu văn lủng củng.' },
              { score: 1.0, label: '1.0đ', description: 'Hành văn mạch lạc, đúng chuẩn mực.' },
              { score: 1.5, label: '1.5đ', description: 'Văn phong truyền cảm, sáng tạo, giàu cá tính.' },
            ],
          },
        ],
        teacherCustomRules: [
          'Không đánh giá thấp bài có cách diễn đạt sáng tạo.',
          'Quan điểm cá nhân hợp lý phải được chấp nhận.',
          'Không bắt buộc học sinh phải sử dụng đúng một dẫn chứng.',
          'Ưu tiên đánh giá sự chân thành và khả năng lập luận sắc bén.',
        ],
        teacherCustomPrompt: 'Đặc biệt khuyến khích học sinh nêu được góc nhìn riêng về sự cân bằng giữa bản lĩnh và lòng trắc ẩn.',
        notes: 'Đề rèn luyện kỹ năng viết bài văn NLXH hoàn chỉnh.',
        status: 'ready',
        createdAt: '2025-01-15',
      };

      const sampleNlvh: ExamRubric = {
        id: 'exam-nlvh-mau-02',
        title: 'Đề Nghị luận văn học: Hình tượng người lính trong văn học hiện đại',
        subject: 'Ngữ văn',
        grade: '12',
        schoolYear: '2024 - 2025',
        essayType: 'Nghị luận văn học',
        type: 'Kiểm tra định kỳ',
        timeLimitMinutes: 90,
        totalScore: 10.0,
        content: `Cảm nhận của anh/chị về vẻ đẹp tâm hồn và lý tưởng cống hiến của người lính qua đoạn trích thơ hiện đại. Từ đó, nhận xét về nét độc đáo trong bút pháp nghệ thuật của tác giả.`,
        gradingGuide: `1. Mở bài (1.0đ): Giới thiệu tác giả, tác phẩm, đoạn trích và vấn đề nghị luận.
2. Cảm nhận vẻ đẹp tâm hồn người lính (4.5đ): Khí phách hiên ngang, tâm hồn lãng mạn, lý tưởng cao cả.
3. Đặc sắc nghệ thuật (2.5đ): Thể thơ, hình ảnh, nhịp điệu, ngôn ngữ giàu tính tạo hình.
4. Đánh giá nâng cao & Phong cách tác giả (1.0đ): Đóng góp của tác giả về đề tài người lính.
5. Kết bài, chính tả, sáng tạo (1.0đ): Tổng kết và khẳng định giá trị tác phẩm.`,
        criteriaList: [
          {
            id: 'crit-nlvh-intro',
            name: 'Mở bài: Dẫn dắt & Giới thiệu tác phẩm, vấn đề',
            description: 'Giới thiệu tác giả, hoàn cảnh sáng tác, đoạn trích và trúng vấn đề.',
            maxScore: 1.0,
            aiGuidance: 'Đánh giá sự tự nhiên và đúng trọng tâm.',
            levels: [
              { score: 0.0, label: '0đ', description: 'Không có mở bài hoặc lạc đề.' },
              { score: 0.5, label: '0.5đ', description: 'Mở bài sơ sài, thiếu giới thiệu trích dẫn.' },
              { score: 1.0, label: '1.0đ', description: 'Mở bài cuốn hút, giới thiệu đầy đủ tác giả, tác phẩm và vấn đề.' },
            ],
          },
          {
            id: 'crit-nlvh-content',
            name: 'Thân bài: Phân tích vẻ đẹp tâm hồn người lính',
            description: 'Khai thác sâu sắc các tầng ý nghĩa, tâm lý và lý tưởng sống của người lính.',
            maxScore: 4.5,
            aiGuidance: 'Linh hoạt chấp nhận các cảm thụ văn học cá nhân bám sát văn bản.',
            levels: [
              { score: 1.0, label: '1.0 - 1.5đ', description: 'Diễn xuôi ý thơ, chưa biết phân tích hình tượng.' },
              { score: 3.0, label: '2.5 - 3.25đ', description: 'Phân tích được các ý chính nhưng còn theo bài mẫu.' },
              { score: 4.5, label: '4.0 - 4.5đ', description: 'Cảm nhận sâu sắc, tinh tế, dẫn chứng thơ chọn lọc và phân tích thấu đáo.' },
            ],
          },
          {
            id: 'crit-nlvh-art',
            name: 'Thân bài: Phân tích nét đặc sắc nghệ thuật',
            description: 'Chỉ ra và làm rõ tác dụng của thể thơ, biện pháp tu từ, ngôn ngữ, hình tượng.',
            maxScore: 2.5,
            aiGuidance: 'Không chỉ liệt kê biện pháp tu từ mà phải chỉ ra giá trị biểu cảm.',
            levels: [
              { score: 0.5, label: '0.5 - 0.75đ', description: 'Liệt kê nghệ thuật đơn thuần, không phân tích tác dụng.' },
              { score: 1.5, label: '1.25 - 1.75đ', description: 'Chỉ ra các nét nghệ thuật chính và tác dụng cơ bản.' },
              { score: 2.5, label: '2.25 - 2.5đ', description: 'Phân tích nghệ thuật sắc sảo, gắn kết hữu cơ với nội dung.' },
            ],
          },
          {
            id: 'crit-nlvh-eval',
            name: 'Đánh giá nâng cao & Nét phong cách tác giả',
            description: 'Đánh giá vị trí đoạn trích, tư tưởng nhân văn và đóng góp của tác giả.',
            maxScore: 1.0,
            aiGuidance: 'Đánh giá tư duy lý luận văn học mở rộng.',
            levels: [
              { score: 0.25, label: '0.25đ', description: 'Đánh giá sơ lược.' },
              { score: 0.65, label: '0.65đ', description: 'Đánh giá đúng nhưng còn chung chung.' },
              { score: 1.0, label: '1.0đ', description: 'Đánh giá sâu sắc, nâng tầm tư tưởng tác phẩm.' },
            ],
          },
          {
            id: 'crit-nlvh-conclusion',
            name: 'Kết bài, chính tả & Sáng tạo văn phong',
            description: 'Kết bài trọn vẹn, không mắc lỗi câu từ, văn phong truyền cảm.',
            maxScore: 1.0,
            aiGuidance: 'Cộng điểm cho bài viết có chất thơ, cảm xúc chân thành.',
            levels: [
              { score: 0.25, label: '0.25đ', description: 'Mắc nhiều lỗi ngữ pháp câu.' },
              { score: 0.65, label: '0.65đ', description: 'Hành văn mạch lạc, đúng chuẩn.' },
              { score: 1.0, label: '1.0đ', description: 'Hành văn lôi cuốn, giàu hình ảnh, có chất văn.' },
            ],
          },
        ],
        teacherCustomRules: [
          'Không đánh giá thấp bài có cách diễn đạt sáng tạo.',
          'Quan điểm cá nhân hợp lý phải được chấp nhận.',
          'Không chấm theo đáp án cứng.',
          'Khuyến khích học sinh có sự liên hệ so sánh mở rộng.',
        ],
        teacherCustomPrompt: 'Đánh giá cao bài viết cảm nhận được nhịp điệu và chất bi tráng trong hình tượng người lính.',
        notes: 'Đề kiểm tra trọng tâm học kỳ II.',
        status: 'ready',
        createdAt: '2025-02-01',
      };

      initialEnriched.push(sampleNlxh, sampleNlvh);
    }

    this.saveRubricsToStorage(initialEnriched);
    return initialEnriched;
  }

  public getRubricById(id: string): ExamRubric | undefined {
    const rubrics = this.getRubrics();
    return rubrics.find((r) => r.id === id);
  }

  public createRubric(data: Partial<ExamRubric>): ExamRubric {
    const rubrics = this.getRubrics();
    const now = new Date().toISOString().split('T')[0];
    const newId = `exam-${Date.now()}`;

    // Calculate total score from criteria list if available
    let totalScore = data.totalScore || 10.0;
    if (data.criteriaList && data.criteriaList.length > 0) {
      const sum = data.criteriaList.reduce((acc, c) => acc + (Number(c.maxScore) || 0), 0);
      if (sum > 0) {
        totalScore = Number(sum.toFixed(2));
      }
    }

    const newRubric: ExamRubric = {
      id: newId,
      title: data.title?.trim() || 'Đề thi & Rubric mới',
      subject: data.subject?.trim() || 'Ngữ văn',
      grade: data.grade || '12',
      schoolYear: data.schoolYear?.trim() || '2024 - 2025',
      essayType: data.essayType || 'Nghị luận xã hội',
      type: data.type || 'Kiểm tra định kỳ',
      timeLimitMinutes: data.timeLimitMinutes || 90,
      totalScore,
      content: data.content?.trim() || '',
      readingPassage: data.readingPassage?.trim() || '',
      promptSocial: data.promptSocial?.trim() || '',
      promptLiterature: data.promptLiterature?.trim() || '',
      gradingGuide: data.gradingGuide?.trim() || '',
      criteriaList: data.criteriaList || [],
      sections: data.sections || [],
      teacherCustomRules: data.teacherCustomRules || [...DEFAULT_TEACHER_CUSTOM_RULES],
      teacherCustomPrompt: data.teacherCustomPrompt?.trim() || '',
      notes: data.notes?.trim() || '',
      status: data.status || 'ready',
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const updatedList = [newRubric, ...rubrics];
    this.saveRubricsToStorage(updatedList);
    return newRubric;
  }

  public updateRubric(id: string, data: Partial<ExamRubric>): ExamRubric {
    const rubrics = this.getRubrics();
    const index = rubrics.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Không tìm thấy đề thi với ID: ${id}`);
    }

    const now = new Date().toISOString().split('T')[0];
    const existing = rubrics[index];

    // Calculate total score if criteria list updated
    let totalScore = data.totalScore !== undefined ? data.totalScore : existing.totalScore;
    if (data.criteriaList && data.criteriaList.length > 0) {
      const sum = data.criteriaList.reduce((acc, c) => acc + (Number(c.maxScore) || 0), 0);
      if (sum > 0) {
        totalScore = Number(sum.toFixed(2));
      }
    }

    const updatedRubric: ExamRubric = {
      ...existing,
      ...data,
      totalScore,
      updatedAt: now,
    };

    rubrics[index] = updatedRubric;
    this.saveRubricsToStorage(rubrics);
    return updatedRubric;
  }

  /**
   * Tính năng sao chép: Tạo đề mới từ một rubric cũ kèm "(Bản sao)"
   */
  public duplicateRubric(id: string): ExamRubric {
    const existing = this.getRubricById(id);
    if (!existing) {
      throw new Error(`Không tìm thấy đề thi với ID: ${id}`);
    }

    const now = new Date().toISOString().split('T')[0];
    const newId = `exam-${Date.now()}`;

    // Deep clone criteria list with new unique IDs
    const clonedCriteria = existing.criteriaList?.map((c, index) => ({
      ...c,
      id: `crit-clone-${Date.now()}-${index}`,
      levels: c.levels?.map((l) => ({ ...l })) || [],
    })) || [];

    const clonedRubric: ExamRubric = {
      ...existing,
      id: newId,
      title: `${existing.title} (Bản sao)`,
      usageCount: 0,
      criteriaList: clonedCriteria,
      createdAt: now,
      updatedAt: now,
      status: 'ready',
    };

    const rubrics = this.getRubrics();
    const updatedList = [clonedRubric, ...rubrics];
    this.saveRubricsToStorage(updatedList);
    return clonedRubric;
  }

  public deleteRubric(id: string): boolean {
    const rubrics = this.getRubrics();
    const filtered = rubrics.filter((r) => r.id !== id);
    if (filtered.length === rubrics.length) {
      return false;
    }
    this.saveRubricsToStorage(filtered);
    return true;
  }

  /**
   * Kiểm tra tính hợp lệ của Rubric trước khi lưu
   */
  public validateRubric(rubric: Partial<ExamRubric>): {
    isValid: boolean;
    errors: string[];
    criteriaSum: number;
    targetScore: number;
  } {
    const errors: string[] = [];
    const targetScore = Number(rubric.totalScore) || 10.0;

    if (!rubric.title || !rubric.title.trim()) {
      errors.push('Tên đề thi không được để trống.');
    }

    if (!rubric.criteriaList || rubric.criteriaList.length === 0) {
      errors.push('Rubric phải có ít nhất một tiêu chí đánh giá.');
    }

    let criteriaSum = 0;
    if (rubric.criteriaList && rubric.criteriaList.length > 0) {
      rubric.criteriaList.forEach((c, idx) => {
        if (!c.name || !c.name.trim()) {
          errors.push(`Tiêu chí số ${idx + 1} chưa có tên tiêu chí.`);
        }
        const score = Number(c.maxScore);
        if (isNaN(score) || score <= 0) {
          errors.push(`Tiêu chí "${c.name || `Số ${idx + 1}`}" phải có điểm tối đa lớn hơn 0.`);
        } else {
          criteriaSum += score;
        }
      });
    }

    criteriaSum = Number(criteriaSum.toFixed(2));

    // Check sum match
    const diff = Math.abs(criteriaSum - targetScore);
    if (diff > 0.01 && criteriaSum > 0) {
      errors.push(
        `Tổng điểm các tiêu chí (${criteriaSum}đ) chưa khớp với Thang điểm của đề (${targetScore}đ). Vui lòng điều chỉnh lại điểm tiêu chí hoặc thang điểm.`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      criteriaSum,
      targetScore,
    };
  }

  /**
   * Tạo cấu trúc prompt chuẩn để sau này truyền vào Gemini:
   * ĐỀ BÀI + HƯỚNG DẪN CHẤM + RUBRIC + YÊU CẦU RIÊNG CỦA GIÁO VIÊN + BÀI VIẾT HỌC SINH
   */
  public buildGeminiGradingPromptPayload(exam: ExamRubric, studentEssayText?: string): string {
    const criteriaFormatted =
      exam.criteriaList && exam.criteriaList.length > 0
        ? exam.criteriaList
            .map(
              (c, idx) => `
[Tiêu chí ${idx + 1}]: ${c.name} (Điểm tối đa: ${c.maxScore}đ)
- Yêu cầu: ${c.description}
- Các mức điểm:
${c.levels.map((l) => `  * ${l.label || `${l.score}đ`}: ${l.description}`).join('\n')}
${c.aiGuidance ? `- Gợi ý cho AI: ${c.aiGuidance}` : ''}`
            )
            .join('\n')
        : 'Sử dụng khung ma trận đánh giá chuẩn của Bộ GD&ĐT.';

    const teacherRulesFormatted =
      exam.teacherCustomRules && exam.teacherCustomRules.length > 0
        ? exam.teacherCustomRules.map((rule, idx) => `${idx + 1}. ${rule}`).join('\n')
        : 'Không có yêu cầu riêng đặc biệt.';

    return `=== THÔNG TIN ĐỀ THI & KHUNG RUBRIC CHẤM BÀI NGỮ VĂN ===
1. ĐỀ BÀI:
- Tên đề: ${exam.title}
- Môn: ${exam.subject || 'Ngữ văn'} | Khối: ${exam.grade} | Loại bài: ${exam.essayType || 'Chung'}
- Nội dung đề bài:
${exam.content || exam.readingPassage || exam.promptSocial || exam.promptLiterature || 'Theo đề bài'}

2. HƯỚNG DẪN CHẤM & ĐÁP ÁN THAM CHIẾU:
${exam.gradingGuide || 'Đánh giá mức độ sáng tạo, cấu trúc lập luận và chuẩn mực chính tả tiếng Việt.'}

3. KHUNG TIÊU CHÍ RUBRIC CHI TIẾT (TỔNG: ${exam.totalScore} ĐIỂM):
${criteriaFormatted}

4. YÊU CẦU CHẤM RIÊNG CỦA GIÁO VIÊN (RẤT QUAN TRỌNG):
${teacherRulesFormatted}
${exam.teacherCustomPrompt ? `* Ghi chú bổ sung từ giáo viên: "${exam.teacherCustomPrompt}"` : ''}

5. BÀI VIẾT CỦA HỌC SINH CẦN ĐÁNH GIÁ:
"""
${studentEssayText || '[Nội dung bài làm của học sinh sẽ được đưa vào đây khi chấm bài]'}
"""

=== YÊU CẦU ĐẦU RA DÀNH CHO AI GEMINI ===
- Chấm chi tiết từng tiêu chí trong Rubric.
- Đưa ra nhận xét khách quan, tôn trọng các "Yêu cầu chấm riêng của giáo viên".
- Chỉ ra các câu văn hay (khen ngợi) và gợi ý sửa lỗi cụ thể (dùng từ, ngữ pháp, lập luận).`;
  }

  private saveRubricsToStorage(rubrics: ExamRubric[]) {
    try {
      localStorage.setItem(RUBRICS_STORAGE_KEY, JSON.stringify(rubrics));
    } catch (e) {
      console.warn('Lỗi lưu rubrics vào LocalStorage:', e);
    }
  }
}

export const examRubricService = new ExamRubricService();
