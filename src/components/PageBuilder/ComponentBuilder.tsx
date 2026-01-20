import React, { useState, useRef, useMemo } from 'react';
import { Plus, Trash2, Download, Copy, Check, Code, Wand2, Eye, AlertTriangle, History, Save } from 'lucide-react';
import {
  validateComponentNameRomanized,
  validateCategoryRomanized,
  generateComponentMetadata
} from '../../utils/componentIdGenerator';
import {
  addComponentTemplate,
  getComponentTemplates,
  getComponentTemplateByName,
  getComponentVersionHistory,
  getComponentTemplateByVersion
} from '../../utils/componentTemplateStorage';
import { componentTemplates } from '../../data/componentTemplates';
import ComponentPreview from './ComponentPreview';
import { validatePropFields, formatValidationMessages, PropField as ValidationPropField } from '../../utils/propValidation';
import { usePageStore } from '../../store/usePageStore';
import { ComponentType } from '../../types';
import { scopeCSSWithSectionId, generateCSSTemplate, appendCustomCSSToFile, isCSSGenerated } from '../../utils/cssTemplateGenerator';
import { generateAndSaveFieldDefinition } from '../../utils/fieldDefinitionStorage';
import { generateAndSaveEditorFile, generateEditorFileName } from '../../utils/editorFileGenerator';

interface PropField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'link' | 'image' | 'color' | 'backgroundColor' | 'colorBoth' | 'array' | 'visibility';
  label: string;
  defaultValue: any;
  description?: string;
  position?: { start: number; end: number };
  elementPath?: string;
  arrayFieldName?: string;
  arrayParentId?: string;
}

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  } as React.CSSProperties,
  header: {
    marginBottom: '24px',
  } as React.CSSProperties,
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '8px',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
  } as React.CSSProperties,
  stepsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '32px',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#9ca3af',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  stepActive: {
    color: '#2563eb',
    backgroundColor: '#dbeafe',
  } as React.CSSProperties,
  stepNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#e5e7eb',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 'bold',
  } as React.CSSProperties,
  stepDivider: {
    width: '60px',
    height: '2px',
    backgroundColor: '#e5e7eb',
    margin: '0 8px',
  } as React.CSSProperties,
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  } as React.CSSProperties,
  formSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '16px',
  } as React.CSSProperties,
  fieldRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
  } as React.CSSProperties,
  field: {
    flex: 1,
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
  } as React.CSSProperties,
  required: {
    color: '#ef4444',
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '100px',
  } as React.CSSProperties,
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: '#ffffff',
  } as React.CSSProperties,
  button: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  buttonSecondary: {
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  iconButton: {
    padding: '8px 12px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  codeSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  codeSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  } as React.CSSProperties,
  codeActions: {
    display: 'flex',
    gap: '8px',
  } as React.CSSProperties,
  codeBlock: {
    backgroundColor: '#1f2937',
    color: '#f9fafb',
    padding: '16px',
    borderRadius: '6px',
    overflowX: 'auto',
    fontSize: '13px',
    fontFamily: 'monospace',
    lineHeight: '1.6',
    margin: 0,
  } as React.CSSProperties,
  saveSection: {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb',
  } as React.CSSProperties,
  saveButton: {
    padding: '12px 24px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  htmlEditor: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'monospace',
    minHeight: '300px',
    resize: 'vertical',
  } as React.CSSProperties,
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '12px',
  } as React.CSSProperties,
  tagItem: {
    padding: '6px 12px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  propsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as React.CSSProperties,
  propCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  } as React.CSSProperties,
  propCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  } as React.CSSProperties,
  propBadge: {
    padding: '4px 8px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
  } as React.CSSProperties,
  propName: {
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#6b7280',
    flex: 1,
  } as React.CSSProperties,
  propCardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  } as React.CSSProperties,
  propFieldRow: {
    display: 'flex',
    gap: '12px',
  } as React.CSSProperties,
  propFieldHalf: {
    flex: 1,
  } as React.CSSProperties,
  propField: {
    marginBottom: '12px',
  } as React.CSSProperties,
  propLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: '6px',
  } as React.CSSProperties,
  propInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  addButton: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  deleteButton: {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    color: '#dc2626',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#9ca3af',
  } as React.CSSProperties,
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  } as React.CSSProperties,
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  modalTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '20px',
  } as React.CSSProperties,
  modalContent: {
    marginBottom: '24px',
  } as React.CSSProperties,
  modalField: {
    marginBottom: '16px',
  } as React.CSSProperties,
  modalLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px',
  } as React.CSSProperties,
  modalInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  modalHint: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
  } as React.CSSProperties,
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  } as React.CSSProperties,
  modalCancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  } as React.CSSProperties,
  modalSaveButton: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  } as React.CSSProperties,
  selectedTextPreview: {
    marginBottom: '16px',
  } as React.CSSProperties,
  selectedTextBox: {
    padding: '8px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: 'monospace',
    marginTop: '4px',
  } as React.CSSProperties,
  nextButton: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  generateButton: {
    padding: '10px 20px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  helpText: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '16px',
    lineHeight: '1.6',
  } as React.CSSProperties,
  codeTextarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'monospace',
    minHeight: '300px',
    resize: 'vertical',
  } as React.CSSProperties,
  savedButton: {
    padding: '12px 24px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    opacity: 0.7,
  } as React.CSSProperties,
  saveHint: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '8px',
    textAlign: 'center',
  } as React.CSSProperties,
};

const ComponentBuilder: React.FC = () => {
  // CATEGORY_ROMANIZED_MAPを動的に生成
  const CATEGORY_ROMANIZED_MAP = useMemo(() => {
    const map: Record<string, string> = {};
    
    // componentTemplates.tsから取得
    componentTemplates.forEach(t => {
      if (t.category && t.categoryRomanized) {
        map[t.category] = t.categoryRomanized;
      }
    });
    
    // localStorageからも取得
    const customTemplates = getComponentTemplates();
    customTemplates.forEach(t => {
      if (t.category && t.categoryRomanized) {
        map[t.category] = t.categoryRomanized;
      }
    });
    
    return map;
  }, []);

  const [componentName, setComponentName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState('KV');
  const [categoryRomanized, setCategoryRomanized] = useState('kv');
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryRomanized, setNewCategoryRomanized] = useState('');
  const [existingCategories, setExistingCategories] = useState<string[]>(['KV', '料金']);
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [cssFiles, setCssFiles] = useState<string[]>([]);
  const [jsFiles, setJsFiles] = useState<string[]>([]);
  const [htmlCode, setHtmlCode] = useState('');
  const [customCssCode, setCustomCssCode] = useState('');
  const [propFields, setPropFields] = useState<PropField[]>([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [showPropModal, setShowPropModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [newPropName, setNewPropName] = useState('');
  const [newPropType, setNewPropType] = useState<PropField['type']>('text');
  const [step, setStep] = useState<'html' | 'props' | 'generate'>('html');
  const [parsedTags, setParsedTags] = useState<Array<{ tag: string; fullElement: string; position: { start: number; end: number }; tagName: string }>>([]);
  const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);
  const [childTags, setChildTags] = useState<Array<{ tag: string; fullElement: string; position: { start: number; end: number }; tagName: string }>>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState<number>(-1);
  const [newCssFile, setNewCssFile] = useState('');
  const [newJsFile, setNewJsFile] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [showPreview, setShowPreview] = useState(false);
  const [previewProps, setPreviewProps] = useState<Record<string, any>>({});
  
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: any[]; warnings: any[] } | null>(null);
  
  const [isArrayField, setIsArrayField] = useState(false);
  const [arrayParentName, setArrayParentName] = useState('');
  const [arrayFieldName, setArrayFieldName] = useState('');
  
  const [saveAsDraft, setSaveAsDraft] = useState(true);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  
  const { pageData, addComponent } = usePageStore();

  const parseHtmlTags = (html: string) => {
    const tags: Array<{ tag: string; fullElement: string; position: { start: number; end: number }; tagName: string }> = [];
    const tagRegex = /<([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^>]*)?)>/g;
    let match;

    const findMatchingCloseTag = (html: string, startPos: number, tagName: string): number => {
      let depth = 1;
      let pos = startPos;
      const openRegex = new RegExp(`<${tagName}(?:\\s[^>]*)?>`, 'g');
      const closeRegex = new RegExp(`</${tagName}>`, 'g');

      openRegex.lastIndex = startPos;
      closeRegex.lastIndex = startPos;

      while (depth > 0 && pos < html.length) {
        const nextOpen = openRegex.exec(html);
        const nextClose = closeRegex.exec(html);

        if (!nextClose) {
          return -1;
        }

        if (nextOpen && nextOpen.index < nextClose.index) {
          depth++;
          pos = openRegex.lastIndex;
          closeRegex.lastIndex = pos;
        } else {
          depth--;
          if (depth === 0) {
            return nextClose.index + nextClose[0].length;
          }
          pos = closeRegex.lastIndex;
          openRegex.lastIndex = pos;
        }
      }

      return -1;
    };

    while ((match = tagRegex.exec(html)) !== null) {
      const tagName = match[1];
      const openTag = match[0];
      const startPos = match.index;
      const openTagEnd = startPos + openTag.length;

      const selfClosingMatch = openTag.match(/\/\s*>$/);
      if (selfClosingMatch) {
        tags.push({
          tag: openTag,
          fullElement: openTag,
          position: { start: startPos, end: openTagEnd },
          tagName
        });
        continue;
      }

      const endPos = findMatchingCloseTag(html, openTagEnd, tagName);

      if (endPos !== -1) {
        const fullElement = html.substring(startPos, endPos);

        tags.push({
          tag: openTag,
          fullElement,
          position: { start: startPos, end: endPos },
          tagName
        });
      }
    }

    const tagsWithDepth = tags.map(tag => {
      let depth = 0;
      for (const other of tags) {
        if (
          tag.position.start > other.position.start &&
          tag.position.end <= other.position.end
        ) {
          depth++;
        }
      }
      return { ...tag, depth };
    });

    const filteredTags = tagsWithDepth.filter((tag, index) => {
      for (let i = 0; i < index; i++) {
        if (
          tagsWithDepth[i].position.start === tag.position.start &&
          tagsWithDepth[i].position.end === tag.position.end
        ) {
          return false;
        }
      }
      return true;
    });

    return filteredTags;
  };

  React.useEffect(() => {
    if (htmlCode) {
      setParsedTags(parseHtmlTags(htmlCode));
    } else {
      setParsedTags([]);
    }
  }, [htmlCode]);

  React.useEffect(() => {
    const loadCategories = () => {
      // componentTemplates.tsからカテゴリを取得
      const categoriesFromTemplates = Array.from(
        new Set(componentTemplates.map(t => t.category))
      ).filter(Boolean);

      // localStorageからもカテゴリを取得
      const customTemplates = getComponentTemplates();
      const categoriesFromStorage = Array.from(
        new Set(customTemplates.map(t => t.category))
      ).filter(Boolean);

      // すべてのカテゴリをマージ
      const allCategories = Array.from(
        new Set([...categoriesFromTemplates, ...categoriesFromStorage])
      ).sort();

      setExistingCategories(allCategories);
    };

    loadCategories();
  }, []);

  const generatePropertyName = (tagName: string, propType: PropField['type']): string => {
    const typeSuffix: Record<PropField['type'], string> = {
      text: 'text',
      textarea: 'textarea',
      link: 'link',
      image: 'image',
      color: 'color',
      backgroundColor: 'bg_color',
      colorBoth: 'color_both',
      array: 'array',
      visibility: 'visible',
    };

    const existingTagProps = propFields.filter(f => {
      const match = f.name.match(new RegExp(`^${tagName}_(\\d+)_`));
      return match !== null;
    });

    const nextNumber = existingTagProps.length + 1;

    return `${tagName}_${nextNumber}_${typeSuffix[propType]}`;
  };

  // タグからクラス名を抽出する関数
  const extractClassName = (fullElement: string): string | null => {
    const classMatch = fullElement.match(/class=["']([^"']+)["']/i);
    if (classMatch && classMatch[1]) {
      return classMatch[1].split(/\s+/)[0];
    }
    return null;
  };

  const findParentArrayElement = (tagIndex: number): number | null => {
    const tag = parsedTags[tagIndex];
    if (!tag) return null;
    
    // 現在のタグより前のタグを検索
    for (let i = tagIndex - 1; i >= 0; i--) {
      const candidate = parsedTags[i];
      if (candidate.tagName === 'ul' || candidate.tagName === 'ol') {
        if (tag.position.start >= candidate.position.start && 
            tag.position.end <= candidate.position.end) {
          return i;
        }
      }
    }
    return null;
  };

  const handleTagClick = (index: number) => {
    const tag = parsedTags[index];
    setSelectedTagIndex(index);
    setSelectedText(tag.fullElement);
    setSelectionRange(tag.position);
    setShowPropModal(true);
    
    setIsArrayField(false);
    setArrayParentName('');
    setArrayFieldName('');
    
    const parentArrayIndex = findParentArrayElement(index);
    if (parentArrayIndex !== null) {
      const parentTag = parsedTags[parentArrayIndex];
      const existingArrayProp = propFields.find(f => 
        f.type === 'array' && 
        f.position && 
        f.position.start === parentTag.position.start
      );
      if (existingArrayProp) {
        setIsArrayField(true);
        setArrayParentName(existingArrayProp.name);
      }
    }

    // 子要素も含めた子タグを抽出してモーダルで選択可能にする
    try {
      const openTagMatch = tag.fullElement.match(/^<([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*)?>/);
      const closeTagMatch = tag.fullElement.match(/<\/([a-zA-Z][a-zA-Z0-9]*)>\s*$/);
      const innerStart = openTagMatch ? openTagMatch[0].length : 0;
      const innerEnd = closeTagMatch ? tag.fullElement.length - closeTagMatch[0].length : tag.fullElement.length;
      const innerHtml = tag.fullElement.slice(innerStart, innerEnd);

      const tags: Array<{ tag: string; fullElement: string; position: { start: number; end: number }; tagName: string }> = [];
      const tagRegex = /<([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^>]*)?)>/g;
      let match;

      const findMatchingCloseTag = (html: string, startPos: number, tagName: string): number => {
        let depth = 1;
        let pos = startPos;
        const openRegex = new RegExp(`<${tagName}(?:\\s[^>]*)?>`, 'g');
        const closeRegex = new RegExp(`</${tagName}>`, 'g');
        openRegex.lastIndex = startPos;
        closeRegex.lastIndex = startPos;
        while (depth > 0 && pos < html.length) {
          const nextOpen = openRegex.exec(html);
          const nextClose = closeRegex.exec(html);
          if (!nextClose) return -1;
          if (nextOpen && nextOpen.index < nextClose.index) {
            depth++;
            pos = openRegex.lastIndex;
            closeRegex.lastIndex = pos;
          } else {
            depth--;
            if (depth === 0) return nextClose.index + nextClose[0].length;
            pos = closeRegex.lastIndex;
            openRegex.lastIndex = pos;
          }
        }
        return -1;
      };

      while ((match = tagRegex.exec(innerHtml)) !== null) {
        const tagName = match[1];
        const openTag = match[0];
        const startPos = match.index;
        const openTagEnd = startPos + openTag.length;

        const selfClosingMatch = openTag.match(/\/\s*>$/);
        const absoluteStart = tag.position.start + innerStart + startPos;
        if (selfClosingMatch) {
          tags.push({
            tag: openTag,
            fullElement: openTag,
            position: { start: absoluteStart, end: absoluteStart + openTag.length },
            tagName,
          });
          continue;
        }

        const endPos = findMatchingCloseTag(innerHtml, openTagEnd, tagName);
        if (endPos !== -1) {
          const fullElement = innerHtml.substring(startPos, endPos);
          const absoluteEnd = tag.position.start + innerStart + endPos;
          tags.push({
            tag: openTag,
            fullElement,
            position: { start: absoluteStart, end: absoluteEnd },
            tagName,
          });
        }
      }

      setChildTags(tags);
      setSelectedChildIndex(-1);
    } catch (e) {
      setChildTags([]);
      setSelectedChildIndex(-1);
    }

    if (tag.tagName === 'a') {
      setNewPropType('link');
    } else if (tag.tagName === 'img') {
      setNewPropType('image');
    } else if (tag.tagName === 'ul' || tag.tagName === 'ol') {
      setNewPropType('array');
    } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div'].includes(tag.tagName)) {
      setNewPropType('text');
    } else {
      setNewPropType('text');
    }
  };

  const renderInteractiveHTML = () => {
    if (!htmlCode) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {parsedTags.map((tag, index) => {
          const isSelected = selectedTagIndex === index;
          const hasProperty = propFields.some(f =>
            f.position && f.position.start === tag.position.start
          );

          // 深さに応じたインデント
          const indent = (tag as any).depth || 0;
          const indentSize = indent * 20;

          // タグの開始部を取得（最初の>まで）
          const openTagMatch = tag.fullElement.match(/^<[^>]+>/);
          const openTag = openTagMatch ? openTagMatch[0] : tag.tag;

          // タグのテキストコンテンツを取得（子要素は除外！）
          let textContent = '';
          const contentMatch = tag.fullElement.match(/^<[^>]+>([^<]*)/);
          if (contentMatch && contentMatch[1].trim()) {
            textContent = contentMatch[1].trim();
            if (textContent.length > 50) {
              textContent = textContent.substring(0, 50) + '...';
            }
          }

          return (
            <div
              key={`tag-${index}`}
              onClick={() => handleTagClick(index)}
              style={{
                marginLeft: `${indentSize}px`,
                color: hasProperty ? '#10b981' : '#3b82f6',
                cursor: 'pointer',
                backgroundColor: isSelected ? '#dbeafe' : hasProperty ? '#d1fae5' : 'transparent',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: hasProperty ? 'bold' : 'normal',
                transition: 'all 0.2s',
                border: isSelected ? '1px solid #3b82f6' : '1px solid transparent',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = hasProperty ? '#d1fae5' : 'transparent';
                }
              }}
            >
              <span style={{ color: hasProperty ? '#10b981' : '#3b82f6', fontWeight: 'bold' }}>
                {openTag}
              </span>
              {textContent && (
                <span style={{ color: '#6b7280', fontSize: '11px', fontStyle: 'italic' }}>
                  "{textContent}"
                </span>
              )}
              {hasProperty && (
                <span style={{
                  fontSize: '10px',
                  color: '#10b981',
                  backgroundColor: '#d1fae5',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontWeight: 'bold'
                }}>
                  プロパティ定義済み
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const addPropertyFromSelection = () => {
    if (!selectedText || !selectionRange) return;

    const baseTag = parsedTags[selectedTagIndex!];
    const target = selectedChildIndex >= 0 ? childTags[selectedChildIndex] : baseTag;

    const autoGeneratedName = generatePropertyName(target.tagName, newPropType);
    setNewPropName(autoGeneratedName);

    const localRange = selectedChildIndex >= 0 ? target.position : selectionRange;
    const localSelectedText = selectedChildIndex >= 0 ? target.fullElement : selectedText;

    const beforeText = htmlCode.substring(0, localRange.start);
    const afterText = htmlCode.substring(localRange.end);

    const findElementTag = (beforeText: string) => {
      const tagMatch = beforeText.match(/<([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*)?>(?:(?!<\1).)*$/s);
      if (tagMatch) {
        const fullTagMatch = beforeText.match(/<([a-zA-Z][a-zA-Z0-9]*)([^>]*)>(?:(?!<\1).)*$/);
        return fullTagMatch ? fullTagMatch[0] : null;
      }
      return null;
    };

    const elementTag = findElementTag(beforeText);
    const elementPath = elementTag || `element-${Date.now()}`;

    const getTextContent = (html: string) => {
      if (typeof window !== 'undefined') {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
      }
      return html.replace(/<[^>]+>/g, '');
    };

    const getDefaultValue = (type: PropField['type'], text: string) => {
      const textContent = getTextContent(localSelectedText);
      switch (type) {
        case 'text':
        case 'textarea': {
          const cleanText = textContent.trim();
          return cleanText || text;
        }
        case 'colorBoth':
          return { color: '#000000', backgroundColor: '#ffffff' };
        case 'color':
        case 'backgroundColor':
          return text.startsWith('#') ? text : '#000000';
        case 'visibility':
          return true;
        case 'array': {
          const itemMatches = localSelectedText.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
          if (itemMatches) {
            return itemMatches.map(match => {
              // <a>タグが含まれているかチェック
              const linkMatch = match.match(/<a[^>]*href=["']([^"']*)["'][^>]*(?:target=["']([^"']*)["'])?[^>]*>([\s\S]*?)<\/a>/i);
              if (linkMatch) {
                // リンクページとして抽出
                const url = linkMatch[1] || '';
                const target = linkMatch[2] || '_self';
                const linkText = getTextContent(linkMatch[3] || '').trim();
                return {
                  url: url,
                  href: url, // 互換性のため両方設定
                  text: linkText || 'リンクテキスト',
                  target: target,
                };
              }
              const textContent = getTextContent(match).trim();
              return textContent || '';
            }).filter(item => {         
              if (typeof item === 'string') {
                return item.length > 0;
              }
              if (typeof item === 'object' && item !== null) {
                return Object.keys(item).length > 0;
              }
              return false;
            });
          }
          return ['1', '2', '3'];
        }
        case 'link': {
          const hrefMatch = localSelectedText.match(/<a[^>]*href=["']([^"']*)["'][^>]*>/i);
          const targetMatch = localSelectedText.match(/<a[^>]*target=["']([^"']*)["'][^>]*>/i);
          const url = hrefMatch ? (hrefMatch[1] || '') : '';
          const target = targetMatch ? targetMatch[1] || '_self' : '_self';
          
          const linkTextMatch = localSelectedText.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
          const linkText = linkTextMatch ? getTextContent(linkTextMatch[1]).trim() : textContent.trim();
          
          return { 
            url: url || '', 
            text: linkText || 'リンクテキスト',
            target,
          };
        }
        case 'image': {
          const fullElement = localSelectedText.match(/<img[^>]*src=["']([^"']+)["'][^>]*(?:alt=["']([^"']+)["'])?[^>]*>/i);
          if (fullElement) {
            const src = fullElement[1] || '';
            const alt = fullElement[2] || '';
            
            let basePath = '';
            let filename = '';
            if (src) {
              const lastSlashIndex = src.lastIndexOf('/');
              if (lastSlashIndex >= 0) {
                basePath = src.substring(0, lastSlashIndex + 1);
                filename = src.substring(lastSlashIndex + 1);
              } else {
                filename = src;
              }
            }
            
            return { 
              src: src, 
              alt: alt,
              basePath: basePath || undefined,
            };
          }
          return { src: text || '', alt: '', basePath: undefined };
        }
      default:
          return text;
      }
    };

    const generateLabel = (name: string) => {
      const parts = name.split('_');
      if (parts.length >= 3) {
        const tagName = parts[0].toUpperCase();
        const number = parts[1];
        const type = parts.slice(2).join(' ');
        return `${tagName} ${number} (${type})`;
      }
      return name.charAt(0).toUpperCase() + name.slice(1);
    };

    if (isArrayField && arrayParentName && arrayFieldName) {
      const parentArrayIndex = findParentArrayElement(selectedTagIndex!);
      let arrayParentProp = propFields.find(f => f.name === arrayParentName && f.type === 'array');
      
      if (!arrayParentProp && parentArrayIndex !== null) {
        const parentTag = parsedTags[parentArrayIndex];
        const arrayDefaultValue = getDefaultValue('array', parentTag.fullElement);
        
        arrayParentProp = {
          id: `prop_${Date.now()}_array`,
          name: arrayParentName,
          type: 'array',
          label: generateLabel(arrayParentName),
          defaultValue: arrayDefaultValue,
          description: '',
          position: parentTag.position,
          elementPath: parentTag.fullElement.match(/^<[^>]+>/) ? parentTag.fullElement.match(/^<[^>]+>/)![0] : '',
        };
        
        setPropFields([...propFields, arrayParentProp]);
      }
      
      if (arrayParentProp) {
        const fieldProp: PropField = {
          id: `prop_${Date.now()}_field`,
          name: autoGeneratedName,
          type: newPropType,
          label: generateLabel(autoGeneratedName),
          defaultValue: getDefaultValue(newPropType, localSelectedText),
          description: '',
          position: localRange,
          elementPath: elementPath,
          arrayFieldName: arrayFieldName,
          arrayParentId: arrayParentProp.id,
        };
        
        setPropFields([...propFields, fieldProp]);
        
        const currentArrayValue = Array.isArray(arrayParentProp.defaultValue) 
          ? arrayParentProp.defaultValue 
          : [];
        
        const updatedArrayValue = currentArrayValue.length > 0
          ? currentArrayValue.map((item: any) => {
              if (typeof item === 'object' && item !== null) {
                return {
                  ...item,
                  [arrayFieldName]: getDefaultValue(newPropType, localSelectedText),
                };
              } else {
                return {
                  [arrayFieldName]: getDefaultValue(newPropType, localSelectedText),
                };
              }
            })
          : [{
              [arrayFieldName]: getDefaultValue(newPropType, localSelectedText),
            }];
        
        setPropFields(prevFields => 
          prevFields.map(f => 
            f.id === arrayParentProp!.id 
              ? { ...f, defaultValue: updatedArrayValue }
              : f
          )
        );
        
        const dataPropAttr = ` data-prop="${arrayParentName}" data-bind-type="array" data-array-field="${arrayFieldName}"`;
        
        const openingTagMatch = localSelectedText.match(/^<([a-zA-Z][a-zA-Z0-9]*)((?:\s[^>]*)?)>/);
        if (openingTagMatch) {
          const tagName = openingTagMatch[1];
          let existingAttrs = openingTagMatch[2] || '';
          const restOfElement = localSelectedText.slice(openingTagMatch[0].length);

          existingAttrs = existingAttrs
            .replace(/\s*data-prop=["'][^"']*["']/gi, '')
            .replace(/\s*data-bind-type=["'][^"']*["']/gi, '')
            .replace(/\s*data-array-field=["'][^"']*["']/gi, '');

          const newOpeningTag = `<${tagName}${existingAttrs}${dataPropAttr}>`;
          const updatedElement = newOpeningTag + restOfElement;
          const newHtml = beforeText + updatedElement + afterText;

          setHtmlCode(newHtml);
        }
      }
    } else {            
      const newField: PropField = {
        id: `prop_${Date.now()}`,
        name: autoGeneratedName,
        type: newPropType,
        label: generateLabel(autoGeneratedName),
        defaultValue: getDefaultValue(newPropType, localSelectedText),
        description: '',
        position: localRange,
        elementPath: elementPath,
      };

      setPropFields([...propFields, newField]);

      const getBindType = (type: PropField['type']) => {
        switch (type) {
          case 'image': return 'image-full';
          case 'link': return 'link-full';
          case 'color': return 'color';
          case 'backgroundColor': return 'background-color';
          case 'colorBoth': return 'color-both';
          case 'visibility': return 'visibility';
          case 'array': return 'array';
          default: return 'text';
        }
      };

      const dataPropAttr = ` data-prop="${autoGeneratedName}" data-bind-type="${getBindType(newPropType)}"`;

      const openingTagMatch = localSelectedText.match(/^<([a-zA-Z][a-zA-Z0-9]*)((?:\s[^>]*)?)>/);
      if (openingTagMatch) {
        const tagName = openingTagMatch[1];
        let existingAttrs = openingTagMatch[2] || '';
        const restOfElement = localSelectedText.slice(openingTagMatch[0].length);

        existingAttrs = existingAttrs
          .replace(/\s*data-prop=["'][^"']*["']/gi, '')
          .replace(/\s*data-bind-type=["'][^"']*["']/gi, '');

        const newOpeningTag = `<${tagName}${existingAttrs}${dataPropAttr}>`;
        const updatedElement = newOpeningTag + restOfElement;
        const newHtml = beforeText + updatedElement + afterText;

        setHtmlCode(newHtml);
      }
    }

    const getBindType = (type: PropField['type']) => {
      switch (type) {
        case 'image': return 'image-full';
        case 'link': return 'link-full';
        case 'color': return 'color';
        case 'backgroundColor': return 'background-color';
        case 'colorBoth': return 'color-both';
        case 'visibility': return 'visibility';
        case 'array': return 'array';
        default: return 'text';
      }
    };

    const dataPropAttr = ` data-prop="${autoGeneratedName}" data-bind-type="${getBindType(newPropType)}"`;

    const openingTagMatch = localSelectedText.match(/^<([a-zA-Z][a-zA-Z0-9]*)((?:\s[^>]*)?)>/);
    if (openingTagMatch) {
      const tagName = openingTagMatch[1];
      let existingAttrs = openingTagMatch[2] || '';
      const restOfElement = localSelectedText.slice(openingTagMatch[0].length);

      existingAttrs = existingAttrs
        .replace(/\s*data-prop=["'][^"']*["']/gi, '')
        .replace(/\s*data-bind-type=["'][^"']*["']/gi, '');

      const newOpeningTag = `<${tagName}${existingAttrs}${dataPropAttr}>`;
      const updatedElement = newOpeningTag + restOfElement;
      const newHtml = beforeText + updatedElement + afterText;

      setHtmlCode(newHtml);
    }

    setShowPropModal(false);
    setNewPropName('');
    setNewPropType('text');
    setSelectedText('');
    setSelectionRange(null);
    setSelectedTagIndex(null);
    setChildTags([]);
    setSelectedChildIndex(-1);
    setIsArrayField(false);
    setArrayParentName('');
    setArrayFieldName('');
  };

  const removePropField = (id: string) => {
    const field = propFields.find(f => f.id === id);
    if (field) {
      if (field.type === 'array') {
        const childFields = propFields.filter(f => f.arrayParentId === id);
        childFields.forEach(childField => {
          if (childField.position) {
            const dataPropRegex = new RegExp(`\\s*data-prop="[^"]*"\\s*data-bind-type="[^"]*"\\s*data-array-field="[^"]*"`, 'g');
            setHtmlCode(prev => prev.replace(dataPropRegex, ''));
          }
        });
        setPropFields(prev => prev.filter(f => f.id !== id && f.arrayParentId !== id));
      } else {
        if (field.position) {
          const dataPropRegex = new RegExp(`\\s*data-prop="${field.name}"[^>]*`, 'g');
          setHtmlCode(htmlCode.replace(dataPropRegex, ''));
        }
        setPropFields(propFields.filter(field => field.id !== id));
      }
    }
  };

  const updatePropField = (id: string, updates: Partial<PropField>) => {
    const updatedFields = propFields.map(field =>
      field.id === id ? { ...field, ...updates } : field
    );
    setPropFields(updatedFields);
    
    updatePreviewProps(updatedFields);
    
    validateProps(updatedFields);
  };

  const updatePreviewProps = (fields: PropField[]) => {
    const props: Record<string, any> = {};
    fields.forEach(field => {
      if (!field.arrayParentId) {
        props[field.name] = field.defaultValue;
      }
    });
    setPreviewProps(props);
  };

  const validateProps = (fields: PropField[]) => {
    const result = validatePropFields(fields as ValidationPropField[]);
    setValidationResult(result);
    return result;
  };

  const computedPreviewProps = useMemo(() => {
    const props: Record<string, any> = {};
    propFields.forEach(field => {
      if (!field.arrayParentId) {
        props[field.name] = field.defaultValue;
      }
    });
    return props;
  }, [propFields]);

  React.useEffect(() => {
    updatePreviewProps(propFields);
    if (propFields.length > 0) {
      validateProps(propFields);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propFields]);

  const generateComponentCode = () => {
    const mainProps = propFields.filter(f => !f.arrayParentId);
    const propNames = mainProps.map(f => f.name).filter(Boolean).join(', ');
    const propsDestructure = mainProps.length > 0 ? `const { ${propNames} } = props;` : '';

    // metadataを取得してsectionIdを使用
    const finalCategory = isNewCategory ? newCategoryName.trim() : category;
    const finalCategoryRomanized = isNewCategory ? newCategoryRomanized.trim() : categoryRomanized;
    const metadata = generateComponentMetadata(
      finalCategory,
      finalCategoryRomanized,
      componentName
    );

    // HTMLコード内のclass属性をclassNameに変換
    // class="..." または class='...' のパターンを検出して変換
    const convertClassToClassName = (html: string): string => {
      // class="..." のパターンを className="..." に変換
      html = html.replace(/\bclass\s*=\s*"([^"]*)"/g, 'className="$1"');
      // class='...' のパターンを className='...' に変換
      html = html.replace(/\bclass\s*=\s*'([^']*)'/g, "className='$1'");
      // class={...} のパターンも className={...} に変換（テンプレートリテラルの場合）
      html = html.replace(/\bclass\s*=\s*\{([^}]*)\}/g, 'className={$1}');
      return html;
    };

    const processedHtmlCode = convertClassToClassName(htmlCode);

    const cssFilesComment = cssFiles.length > 0
      ? `/**
 * Required CSS Files:
${cssFiles.map(file => ` * - /generator_common/css/${file}`).join('\n')}
 */

`
      : '';

    const jsFilesComment = jsFiles.length > 0
      ? `/**
 * Required JS Files:
${jsFiles.map(file => ` * - /generator_common/js/${file}`).join('\n')}
 */

`
      : '';

    const code = `${cssFilesComment}${jsFilesComment}import React from 'react';
import { ComponentData } from '../../types';
import { useComponentData } from '../../hooks/useComponentData';
import { useDataPropBinding } from '../../hooks/useDataPropBinding';

interface ${componentName}Props {
  component: ComponentData;
  isEditing?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ component }) => {
  const { props, style, globalStyles } = useComponentData(component);
  const containerRef = useDataPropBinding({ props });

  ${propsDestructure}

  const containerStyle: React.CSSProperties = {
    backgroundColor: style?.backgroundColor || globalStyles.baseColor,
    padding: '60px 20px',
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
  };

  return (
    <section id="${metadata.sectionId}" ref={containerRef} style={containerStyle}>
      <div style={innerStyle}>
${processedHtmlCode.split('\n').map(line => '        ' + line).join('\n')}
      </div>
    </section>
  );
};

export default ${componentName};`;

    setGeneratedCode(code);
    setStep('generate');
  };

  const saveComponentAndCreateFiles = async () => {
    if (!componentName || !displayName) {
      alert('コンポーネント名と表示名が未入力です');
      return;
    }

    // プロパティのバリデーション（プロパティが存在する場合のみ）
    if (propFields.length > 0) {
      const validation = validateProps(propFields);
      if (!validation.isValid) {
        const messages = formatValidationMessages(validation);
        const confirmMessage = `プロパティにエラーがあります\n\n${messages.join('\n')}\n\nそれでも保存しますか？`;
        if (!window.confirm(confirmMessage)) {
          return;
        }
      }
    }

    // コンポーネント名のバリデーション（ローマ字のみ）
    const componentNameValidation = validateComponentNameRomanized(componentName);
    if (!componentNameValidation.valid) {
      alert(componentNameValidation.error);
      return;
    }

    if (isNewCategory && !newCategoryName.trim()) {
      alert('新しいカテゴリ名を入力してください');
      return;
    }

    if (isNewCategory && !newCategoryRomanized.trim()) {
      alert('カテゴリ名（ローマ字）を入力してください');
      return;
    }

    // カテゴリ名（ローマ字）のバリデーション
    if (isNewCategory) {
      const categoryValidation = validateCategoryRomanized(newCategoryRomanized);
      if (!categoryValidation.valid) {
        alert(categoryValidation.error);
        return;
      }
    }

    const finalCategory = isNewCategory ? newCategoryName.trim() : category;
    const finalCategoryRomanized = isNewCategory ? newCategoryRomanized.trim() : categoryRomanized;

    // 一意なIDとメタデータを生成
    const metadata = generateComponentMetadata(
      finalCategory,
      finalCategoryRomanized,
      componentName
    );

    // unique_idの重複チェック
    const existingTemplates = getComponentTemplates();
    const existingComponent = existingTemplates.find(t => t.uniqueId === metadata.uniqueId);

    if (existingComponent) {
      alert(`このunique_id: ${metadata.uniqueId} は既に使用されています。\n既存のコンポーネント: ${existingComponent.displayName}\n\n異なるコンポーネント名またはカテゴリを選択してください。`);
      return;
    }

    const defaultProps: Record<string, any> = {};
    const propSchema = propFields.map(field => ({
      name: field.name,
      type: field.type,
      label: field.label,
      defaultValue: field.defaultValue,
      description: field.description,
    }));

    propFields.forEach(field => {
      if (field.name) {
        defaultProps[field.name] = field.defaultValue;
      }
    });

    // HTMLコード内のclass属性をclassNameに変換する関数
    const convertClassToClassName = (html: string): string => {
      // class="..." のパターンを className="..." に変換
      html = html.replace(/\bclass\s*=\s*"([^"]*)"/g, 'className="$1"');
      // class='...' のパターンを className='...' に変換
      html = html.replace(/\bclass\s*=\s*'([^']*)'/g, "className='$1'");
      // class={...} のパターンも className={...} に変換（テンプレートリテラルの場合）
      html = html.replace(/\bclass\s*=\s*\{([^}]*)\}/g, 'className={$1}');
      return html;
    };

    // generatedCodeが空の場合でも基本的なコンポーネントファイルを生成
    let finalGeneratedCode = generatedCode;
    if (!finalGeneratedCode || !finalGeneratedCode.trim()) {
      const mainProps = propFields.filter(f => !f.arrayParentId);
      const propNames = mainProps.map(f => f.name).filter(Boolean).join(', ');
      const propsDestructure = mainProps.length > 0 ? `const { ${propNames} } = props;` : '';

      // HTMLコード内のclass属性をclassNameに変換
      const processedHtmlCode = convertClassToClassName(htmlCode || '<!-- HTMLコードをここに追加してください -->');

      const cssFilesComment = cssFiles.length > 0
        ? `/**
 * Required CSS Files:
${cssFiles.map(file => ` * - /generator_common/css/${file}`).join('\n')}
 */

`
        : '';

      const jsFilesComment = jsFiles.length > 0
        ? `/**
 * Required JS Files:
${jsFiles.map(file => ` * - /generator_common/js/${file}`).join('\n')}
 */

`
        : '';

      finalGeneratedCode = `${cssFilesComment}${jsFilesComment}import React from 'react';
import { ComponentData } from '../../types';
import { useComponentData } from '../../hooks/useComponentData';
import { useDataPropBinding } from '../../hooks/useDataPropBinding';

interface ${componentName}Props {
  component: ComponentData;
  isEditing?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ component }) => {
  const { props, style, globalStyles } = useComponentData(component);
  const containerRef = useDataPropBinding({ props });

  ${propsDestructure}

  const containerStyle: React.CSSProperties = {
    backgroundColor: style?.backgroundColor || globalStyles?.baseColor || '#ffffff',
    padding: '60px 20px',
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
  };

  return (
    <section id="${metadata.sectionId}" ref={containerRef} style={containerStyle}>
      <div style={innerStyle}>
        ${processedHtmlCode}
      </div>
    </section>
  );
};

export default ${componentName};`;
    } else {
      // generatedCodeが既に存在する場合も、class属性をclassNameに変換
      finalGeneratedCode = convertClassToClassName(finalGeneratedCode);
    }

    try {
      // 1. コンポーネントファイル名を生成
      const componentFileName = componentName
        .split(/[\s-]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('') + 'Component.tsx';

      console.log('生成されたコンポーネントファイル名', componentFileName);
      console.log('生成されたコード', finalGeneratedCode);

      const templateData = {
        name: componentName,
        nameRomanized: componentName,
        displayName: displayName,
        category: finalCategory,
        categoryRomanized: finalCategoryRomanized,
        uniqueId: metadata.uniqueId,
        sectionId: metadata.sectionId,
        description,
        thumbnailUrl: thumbnailUrl,
        codeTemplate: finalGeneratedCode,
        defaultProps: defaultProps,
        propSchema: propSchema,
        cssFiles: cssFiles,
        jsFiles: jsFiles,
        customCssCode: customCssCode.trim() || undefined,
        isActive: true,
      };

      // 2. localStorageに保存
      const savedTemplate = addComponentTemplate(templateData);

      // 2.5. propSchemaからフィールド定義を自動生成して保存
      // 注意: この時点ではまだvalidComponentTypeが決定されていないため、
      // 後でページに追加する際に決定されるタイプを使用する
      // ここでは一時的にcomponentTypeFromNameを使用し、後で更新する
      let generatedComponentType: string | null = null;
      let generatedFieldConfig: any = null;
      
      if (propSchema && propSchema.length > 0) {
        try {
          // コンポーネントタイプを生成（例: "programHero" -> "program-hero"）
          const componentTypeFromName = componentName
            .replace(/Component$/i, '')
            .replace(/([A-Z])/g, '-$1')
            .toLowerCase()
            .replace(/^-/, '');
          
          // カテゴリマッピングを考慮したタイプを決定
          const categoryTypeMap: Record<string, string> = {
            'kv': 'kv',
            'pricing': 'pricing',
            'streaming': 'app-intro',
            'faq': 'test',
            'footer': 'footer',
            'test': 'test',
          };
          
          // カテゴリからタイプを決定、なければcomponentTypeFromNameを使用
          generatedComponentType = categoryTypeMap[finalCategoryRomanized] || componentTypeFromName;
          
          generatedFieldConfig = generateAndSaveFieldDefinition(generatedComponentType, propSchema);
          console.log('フィールド定義を自動生成しました:', generatedComponentType);
        } catch (error) {
          console.warn('フィールド定義の生成に失敗しました:', error);
        }
      }

      // 4. CSSファイルの準備（カスタムCSSがある場合）
      let cssFileName: string | undefined;
      let cssContent: string | undefined;
      let isExistingCategoryForCSS = false;
      
      if (customCssCode && customCssCode.trim()) {
        const sectionId = metadata.sectionId;
        const { getCSSMetadata } = await import('../../utils/cssTemplateGenerator');
        
        // 既存のカテゴリかどうかをチェック
        const existingMetadata = getCSSMetadata().find(m => m.category === finalCategory);
        isExistingCategoryForCSS = !!existingMetadata;
        
        if (isExistingCategoryForCSS) {
          // 既存のカテゴリの場合：既存のCSSファイルに追加する形式で、カスタムCSSのみを含むファイルを生成
          cssFileName = existingMetadata.fileName;
          const scopedCss = scopeCSSWithSectionId(customCssCode, sectionId);
          cssContent = `/* ======================================== */\n/* ${displayName} のカスタムCSS追加分 */\n/* ======================================== */\n\n${scopedCss}`;
        } else {
          // 新規カテゴリの場合：カスタムCSSのみを生成（ベースCSSは生成しない）
          cssFileName = metadata.cssFileName || `${finalCategoryRomanized}.css`;
          
          // カスタムCSSをスコープ化して追加（ベースCSSは生成しない）
          const scopedCss = scopeCSSWithSectionId(customCssCode, sectionId);
          cssContent = scopedCss;
          
          // メタデータを保存（新規カテゴリの場合のみ）
          const { saveCSSMetadata, generateSectionId: generateSectionIdForCSS } = await import('../../utils/cssTemplateGenerator');
          saveCSSMetadata({
            category: finalCategory,
            fileName: cssFileName,
            sectionId: generateSectionIdForCSS(finalCategory),
            generated: true
          });
        }
      }

      // 5. ローカルAPIを呼び出してコンポーネントファイルとCSSファイルを自動作成
      try {
        if (finalGeneratedCode) {
          const response = await fetch('/api/create-component', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              componentName,
              displayName,
              category: finalCategory,
              categoryRomanized: finalCategoryRomanized,
              generatedCode: finalGeneratedCode,
              uniqueId: metadata.uniqueId,
              sectionId: metadata.sectionId,
              cssContent: cssContent,
              cssFileName: cssFileName,
              isExistingCategory: isExistingCategoryForCSS,
              isNewCategory: !isExistingCategoryForCSS,
              defaultProps: defaultProps,
              propSchema: propSchema,
              cssFiles: cssFiles,
              jsFiles: jsFiles,
              description: description,
              thumbnailUrl: thumbnailUrl,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (data.success) {
            console.log('Component file created:', data);
            
            // 2.6. エディターファイルを自動生成
            let editorFileGenerated = false;
            let editorFileError: string | null = null;
            
            if (generatedComponentType && generatedFieldConfig) {
              try {
                await generateAndSaveEditorFile(generatedComponentType, generatedFieldConfig);
                editorFileGenerated = true;
                console.log('エディターファイルを自動生成しました:', generatedComponentType);
              } catch (error) {
                editorFileError = error instanceof Error ? error.message : '不明なエラー';
                console.warn('エディターファイルの生成に失敗しました:', error);
                // エディターファイルの生成に失敗しても、コンポーネント作成は続行
              }
            }
            
            // 成功メッセージを構築
            const createdFiles = [
              data.fileName,
              data.cssFileName,
              ...(generatedComponentType && editorFileGenerated ? [generateEditorFileName(generatedComponentType)] : [])
            ].filter(Boolean);
            
            let successMessage = `コンポーネント「${displayName}」が正常に作成されました！\n\n作成されたファイル:\n${createdFiles.map(f => `- ${f}`).join('\n')}\n\ncomponentTemplates.tsも更新されました。`;
            
            if (generatedComponentType) {
              if (editorFileGenerated) {
                successMessage += `\n\n✅ エディターファイルも自動生成されました。プロパティパネルで編集可能です。`;
              } else if (editorFileError) {
                successMessage += `\n\n⚠️ エディターファイルの生成に失敗しました: ${editorFileError}\nフィールド定義は保存されているため、汎用エディタで編集可能です。`;
              } else {
                successMessage += `\n\nℹ️ エディターファイルは生成されませんでした（propSchemaが空の可能性があります）。\n汎用エディタで編集可能です。`;
              }
            }
            
            alert(successMessage);
          } else {
            // ファイル重複エラーの場合
            if (data.error === 'FILE_EXISTS') {
              alert(`エラー: ファイル「${data.fileName}」は既に存在します。\n\nファイルパス: ${data.filePath}\n\n別のコンポーネント名またはカテゴリを選択してください。`);
              throw new Error(data.message || 'ファイルが既に存在します');
            } else {
              throw new Error(data.error || data.message || 'コンポーネントの作成に失敗しました');
            }
          }
        }
      } catch (error) {
        console.error('コンポーネントファイルの作成に失敗しました:', error);
        alert(`コンポーネントファイルの作成に失敗しました。\n\nエラー: ${error instanceof Error ? error.message : '不明なエラー'}\n\n開発サーバー（npm run dev）が起動していることを確認してください。`);
        // フォールバック：ダウンロード
        if (finalGeneratedCode) {
          downloadComponentFile(componentName, finalGeneratedCode);
        }
        if (cssContent && cssFileName) {
          const blob = new Blob([cssContent], { type: 'text/css' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = cssFileName;
          a.click();
          URL.revokeObjectURL(url);
        }
      }

      // 6. 関連ファイル更新ガイドのダウンロード - 削除（自動化されたため不要）

      // 7. ページにコンポーネントを自動追加
      try {
        // componentNameからタイプを生成（例: "programHero" -> "program-hero"）
        // ComponentLibraryと同じ方法でタイプを決定
        const componentTypeFromName = componentName
          .replace(/Component$/i, '')
          .replace(/([A-Z])/g, '-$1')
          .toLowerCase()
          .replace(/^-/, '');
        
        // 既存のComponentTypeに存在するかチェック（componentRegistryから取得）
        const existingTypes: ComponentType[] = Object.keys(COMPONENT_TYPE_MAP) as ComponentType[];
        
        // カテゴリマッピングを使用してタイプを決定
        const categoryTypeMap: Record<string, ComponentType> = {
          'kv': 'kv',
          'pricing': 'pricing',
          'streaming': 'app-intro',
          'faq': 'test',
          'footer': 'footer',
          'test': 'test',
        };
        
        let validComponentType: ComponentType = categoryTypeMap[finalCategoryRomanized] || 
          (existingTypes.includes(componentTypeFromName as ComponentType) 
            ? (componentTypeFromName as ComponentType)
            : 'test' as ComponentType); // フォールバック
        
        // componentTemplates.tsから該当するテンプレートを取得してtemplateIdを設定
        const matchingTemplate = componentTemplates.find(t => 
          t.uniqueId === metadata.uniqueId || t.id === metadata.uniqueId
        );
        
        const newComponent = {
          id: `${validComponentType}-${Date.now()}`,
          type: validComponentType,
          props: { ...defaultProps },
          style: { theme: 'light' as const, colorScheme: 'blue' as const },
          templateId: matchingTemplate?.id || metadata.uniqueId, // テンプレートIDを保存
        };
        
        addComponent(newComponent);
      } catch (error) {
        console.warn('ページへのコンポーネント追加に失敗しました:', error);
        // エラーが発生しても続行
      }

      if (isNewCategory && newCategoryName.trim()) {
        if (!existingCategories.includes(finalCategory)) {
          setExistingCategories([...existingCategories, finalCategory].sort());
        }
        setCategory(finalCategory);
        setIsNewCategory(false);
        setNewCategoryName('');
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      
      const saveMessage = saveAsDraft 
        ? 'コンポーネントがドラフト版として保存され、ページに追加されました'
        : 'コンポーネントがリリース版として保存され、ページに追加されました';
      alert(saveMessage);
    } catch (error) {
      console.error('Error saving component:', error);
      alert(`保存エラー: ${error}`);
    }
  };

  // バージョン履歴を読み込む
  const loadVersionHistory = async (uniqueId: string) => {
    const history = await getComponentVersionHistory(uniqueId);
    setVersionHistory(history);
    setShowVersionHistory(true);
  };

  // 特定のバージョンをロード
  const loadVersion = async (uniqueId: string, version: number) => {
    const template = await getComponentTemplateByVersion(uniqueId, version);
    if (template) {
      // テンプレートデータをフォームに反映
      setComponentName(template.name);
      setDisplayName(template.displayName);
      setCategory(template.category);
      setCategoryRomanized(template.categoryRomanized);
      setDescription(template.description || '');
      setThumbnailUrl(template.thumbnailUrl || '');
      setCssFiles(template.cssFiles);
      setJsFiles(template.jsFiles);
      setCustomCssCode(template.customCssCode || '');
      setHtmlCode(template.codeTemplate);
      // propFieldsの復元が必要なので、コード生成から送信する必要がある
      setGeneratedCode(template.codeTemplate);
      alert(`バージョン ${version} を読み込みました`);
    }
  };

  // コンポーネントファイルをダウンロード
  const downloadComponentFile = (name: string, code: string) => {
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.tsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 関連ファイル更新ガイドを生成・ダウンロード
  const downloadRelatedFilesGuide = (
    componentName: string,
    displayName: string,
    category: string,
    categoryRomanized: string,
    metadata: any,
    defaultProps: Record<string, any>,
    propSchema: any[],
    thumbnailUrlValue: string,
    cssFilesValue: string[],
    jsFilesValue: string[]
  ) => {
    // ComponentTypeに追加する必要があるかチェック
    // uniqueIdからコンポーネントタイプを生成（kv_program_hero -> kv-program-hero）
    const componentType = metadata.uniqueId.replace(/_/g, '-');
    
    // 既存のComponentTypeをチェック（componentRegistryから取得）
    const existingTypes: string[] = Object.keys(COMPONENT_TYPE_MAP);
    const needsTypeUpdate = !existingTypes.includes(componentType);
    
    // componentTemplates.tsに追加するコード
    const componentTemplateCode = `  {
    id: '${componentType}',
    type: '${componentType}' as ComponentType,
    name: '${componentName}',
    nameRomanized: '${componentName}',
    displayName: '${displayName}',
    description: '${displayName}',
    thumbnail: '${thumbnailUrlValue || ''}',
    category: '${category}',
    categoryRomanized: '${categoryRomanized}',
    uniqueId: '${metadata.uniqueId}',
    sectionId: '${metadata.sectionId}',
    defaultProps: ${JSON.stringify(defaultProps, null, 8).replace(/\n/g, '\n    ')},
    propSchema: ${JSON.stringify(propSchema, null, 8).replace(/\n/g, '\n    ')},
    cssFiles: ${JSON.stringify(cssFilesValue)},
    jsFiles: ${JSON.stringify(jsFilesValue)},
  },`;

    // types/index.tsに追加する必要がある場合、コードを生成
    const typeUpdateCode = needsTypeUpdate
      ? `\n  | '${componentType}'`
      : '';

    const guide = `# 関連ファイル更新ガイド

## 1. コンポーネントファイルの配置

生成されたコンポーネントファイルを以下の場所に配置してください:

\`src/components/Components/${componentName}.tsx\`

※ 既にダウンロードされたファイルをそのまま配置してください


## 2. src/data/componentTemplates.ts の更新

以下のコードを \`componentTemplates\` 配列に追加してください:

\`\`\`typescript
${componentTemplateCode}
\`\`\`

注：配列の最後にカンマ！を追加することを忘れないでください


## 3. src/utils/componentRegistry.ts の更新

コンポーネントタイプとコンポーネント名のマッピングを追加する必要がある場合

\`\`\`typescript
export const COMPONENT_TYPE_MAP = {
  // ... 既存のエントリ ...
  '${componentType}': '${componentName}',
  // ... 残りのエントリ ...
} as const;
\`\`\`

  ${needsTypeUpdate ? `⚠ 注：'${componentType}': '${componentName}' をCOMPONENT_TYPE_MAPに追加する必要があります。` : `✅'${componentType}' は既存のタイプです。追加不要ですが、確認してください。`}

注：コンポーネントビルダーで「コンポーネント追加」をクリックすると、自動的にcomponentRegistry.tsが更新されます。


## 完了

すべてのファイルを更新したら、アプリケーションを起動またはリロードしてください
新しいコンポーネントがコンポーネントライブラリに表示されるようになります

---
生成日: ${new Date().toLocaleString('ja-JP')}
コンポーネント名: ${componentName}
表示名: ${displayName}
カテゴリ: ${category} (${categoryRomanized})
Unique ID: ${metadata.uniqueId}
`;

    const blob = new Blob([guide], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${componentName}_更新ガイチEmd`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setIsCodeCopied(true);
      setTimeout(() => setIsCodeCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${componentName}.tsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>コンポーネントビルダー</h2>
        <p style={styles.subtitle}>
          基本情報を入力し、HTMLコードを貼り付けて、対話式プロパティを定義できます
        </p>
      </div>

      <div style={styles.stepsContainer}>
        <div style={{ ...styles.step, ...(step === 'html' ? styles.stepActive : {}) }}>
          <div style={styles.stepNumber}>1</div>
          <span>基本情報・HTML</span>
        </div>
        <div style={styles.stepDivider}></div>
        <div style={{ ...styles.step, ...(step === 'props' ? styles.stepActive : {}) }}>
          <div style={styles.stepNumber}>2</div>
          <span>プロパティ定義</span>
        </div>
        <div style={styles.stepDivider}></div>
        <div style={{ ...styles.step, ...(step === 'generate' ? styles.stepActive : {}) }}>
          <div style={styles.stepNumber}>3</div>
          <span>コード生成</span>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.formSection}>
          <h3 style={styles.sectionTitle}>基本情報</h3>

          <div style={styles.fieldRow}>
            <div style={styles.field}>
              <label style={styles.label}>
                コンポーネント名 <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                style={styles.input}
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                placeholder="custom-hero（半角英数字、ハイフンのみ）"
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                半角英数字とハイフン、スペースのみ使用可、ESS IDとコンポーネント識別子に使用されます
              </p>
              {componentName && (isNewCategory ? newCategoryRomanized : categoryRomanized) && (
                <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                  <p style={{ fontSize: '11px', color: '#0369a1', margin: '0 0 4px 0', fontWeight: 'bold' }}>
                    生成されるID:
                  </p>
                  <p style={{ fontSize: '12px', color: '#0c4a6e', margin: '0', fontFamily: 'monospace' }}>
                    unique_id: <strong>{generateComponentMetadata(isNewCategory ? newCategoryName : category, isNewCategory ? newCategoryRomanized : categoryRomanized, componentName).uniqueId}</strong>
                  </p>
                  <p style={{ fontSize: '12px', color: '#0c4a6e', margin: '4px 0 0', fontFamily: 'monospace' }}>
                    section_id: <strong>{generateComponentMetadata(isNewCategory ? newCategoryName : category, isNewCategory ? newCategoryRomanized : categoryRomanized, componentName).sectionId}</strong>
                  </p>
                </div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                表示名<span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                style={styles.input}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="カスタムヒーローセクション"
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                日本語OK。コンポーネントライブラリに表示される名前です
              </p>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>カテゴリ</label>
              <select
                style={styles.input}
                value={isNewCategory ? '__new__' : category}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setIsNewCategory(true);
                    setNewCategoryName('');
                    setNewCategoryRomanized('');
                  } else {
                    setIsNewCategory(false);
                    setCategory(e.target.value);
                    setCategoryRomanized(CATEGORY_ROMANIZED_MAP[e.target.value] || e.target.value.toLowerCase());
                  }
                }}
              >
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__new__">+ 新しいカテゴリを追加</option>
              </select>
            </div>
          </div>

          {isNewCategory && (
            <div style={{ marginTop: '16px' }}>
              <div style={styles.fieldRow}>
                <div style={styles.field}>
                  <label style={styles.label}>
                    新しいカテゴリ名<span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    style={styles.input}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="特別イベント、キャンペーン"
                  />
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    日本語・英語どちらでも可
                  </p>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    カテゴリ名（ローマ字！）<span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    style={styles.input}
                    value={newCategoryRomanized}
                    onChange={(e) => setNewCategoryRomanized(e.target.value)}
                    placeholder="special, event, campaign"
                  />
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    半角英数字とハイフンのみ、ESSファイル名に使用されます
                  </p>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '12px' }}>
              読み込むCSSファイル
            </h4>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
              public/generator_common/css/ 配下のファイルを指定してください
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                style={{ ...styles.input, flex: 1 }}
                value={newCssFile}
                onChange={(e) => setNewCssFile(e.target.value)}
                placeholder="style.css"
              />
              <button
                style={styles.addButton}
                onClick={() => {
                  if (newCssFile.trim()) {
                    setCssFiles([...cssFiles, newCssFile.trim()]);
                    setNewCssFile('');
                  }
                }}
              >
                <Plus size={16} />
              </button>
            </div>
            {cssFiles.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {cssFiles.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 10px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  >
                    <span>{file}</span>
                    <button
                      onClick={() => setCssFiles(cssFiles.filter((_, i) => i !== index))}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#ef4444',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '12px' }}>
              読み込むJSファイル
            </h4>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
              public/generator_common/js/ 配下のファイルを指定してください
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                style={{ ...styles.input, flex: 1 }}
                value={newJsFile}
                onChange={(e) => setNewJsFile(e.target.value)}
                placeholder="script.js"
              />
              <button
                style={styles.addButton}
                onClick={() => {
                  if (newJsFile.trim()) {
                    setJsFiles([...jsFiles, newJsFile.trim()]);
                    setNewJsFile('');
                  }
                }}
              >
                <Plus size={16} />
              </button>
            </div>
            {jsFiles.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {jsFiles.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 10px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  >
                    <span>{file}</span>
                    <button
                      onClick={() => setJsFiles(jsFiles.filter((_, i) => i !== index))}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#ef4444',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={styles.formSection}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              <Code size={20} style={{ marginRight: '8px' }} />
              基本情報とHTMLコード
            </h3>
            {htmlCode && componentName && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={styles.nextButton}
                  onClick={() => setStep('props')}
                >
                  次へ・プロパティ定義
                </button>
                <button
                  style={{ ...styles.generateButton, padding: '8px 16px', fontSize: '13px' }}
                  onClick={generateComponentCode}
                >
                  <Wand2 size={16} style={{ marginRight: '4px' }} />
                  スキマーしてコード生成
                </button>
              </div>
            )}
          </div>

          <p style={styles.helpText}>
            基本情報を入力し、HTMLコードを貼り付けてください。表示されるタグ一覧から、親要素・子要素問わず任意のタグをクリックしてプロパティを定義できます
          </p>

          <div style={{
            padding: '12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '6px',
            border: '1px solid #bae6fd',
            marginBottom: '12px',
          }}>
            <p style={{ fontSize: '13px', color: '#0369a1', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              💡 使い方
            </p>
            <ol style={{ fontSize: '12px', color: '#0369a1', margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>基本情報を入力し、コンポーネント名、カテゴリなどを入力</li>
              <li>HTMLコードを入力または貼り付け</li>
              <li><strong>任意！</strong> 表示されるタグ一覧から<strong>親要素・子要素問わず任意のタグ</strong>をクリック</li>
              <li><strong>任意！</strong> プロパテグタイプを選択して追加・複数のタグにプロパティ定義可能</li>
              <li>「次へ・プロパティ定義」をクリック、または直接「コード生成」でコンポーネント作成</li>
            </ol>
            <p style={{ fontSize: '11px', color: '#0369a1', margin: '8px 0 0', fontStyle: 'italic' }}>
              ※ プロパティなしでも静的コンポーネントとして生成できます
            </p>
          </div>

          <textarea
            ref={textareaRef}
            style={styles.codeTextarea}
            value={htmlCode}
            onChange={(e) => setHtmlCode(e.target.value)}
            placeholder={`例！
<h2>タイトルをここに入劁E/h2>
<p>説明文をここに入力</p>
<img src="/path/to/image.jpg" alt="画像説明" />
<ul>
  <li>リスト1</li>
  <li>リスト2</li>
</ul>
`}
            rows={8}
          />

          {parsedTags.length > 0 && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <p style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: '#374151',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Wand2 size={16} />
                  すべてのタグ・親・子要素・クリックしてプロパティを定義
                </p>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                  <span style={{ color: '#3b82f6' }}>◁クリック可能</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>◁プロパティ定義済み</span>
                </div>
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                lineHeight: '1.8',
                backgroundColor: '#ffffff',
                padding: '16px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                maxHeight: '400px',
                overflowY: 'auto',
              }}>
                {renderInteractiveHTML()}
              </div>
            </div>
          )}

          {/* CSSコード入力欄 */}
          <div style={{ marginTop: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151', margin: 0 }}>
                <Code size={18} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />
                CSSコード（任意）
              </h4>
            </div>
            <p style={styles.helpText}>
              CSSコードを入力すると、設定したカテゴリのCSSファイルに自動的に追加されます。コンポーネント特有のIDでスコープ化されるため、他のCSSと競合しません。
            </p>
            <textarea
              style={styles.codeTextarea}
              value={customCssCode}
              onChange={(e) => setCustomCssCode(e.target.value)}
              placeholder={`例：
.my-custom-class {
  color: #333;
  font-size: 16px;
}

.my-button {
  background-color: #3b82f6;
  padding: 12px 24px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .my-custom-class {
    font-size: 14px;
  }
}`}
              rows={8}
            />
          </div>

          {/* リアルタイムプレビュー */}
          {htmlCode && (
            <div style={{ marginTop: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151', margin: 0 }}>
                  <Eye size={18} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />
                  リアルタイムプレビュー
                </h4>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: showPreview ? '#3b82f6' : '#f3f4f6',
                    color: showPreview ? '#ffffff' : '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {showPreview ? '非表示' : '表示'}
                </button>
              </div>
              {showPreview && (
                <div style={{
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                }}>
                  <ComponentPreview
                    htmlCode={htmlCode}
                    props={computedPreviewProps}
                    cssFiles={cssFiles}
                    customCssCode={customCssCode}
                    sectionId={(() => {
                      // プレビュー用のsectionIdを計算
                      if (componentName && (isNewCategory ? newCategoryName : category)) {
                        try {
                          const finalCategory = isNewCategory ? newCategoryName.trim() : category;
                          const finalCategoryRomanized = isNewCategory ? newCategoryRomanized.trim() : categoryRomanized;
                          const metadata = generateComponentMetadata(
                            finalCategory,
                            finalCategoryRomanized,
                            componentName
                          );
                          return metadata.sectionId;
                        } catch (error) {
                          console.warn('Failed to generate sectionId for preview:', error);
                          return undefined;
                        }
                      }
                      return undefined;
                    })()}
                    globalStyles={pageData.globalStyles}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {htmlCode && (
          <div style={styles.formSection}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>
                <Wand2 size={20} style={{ marginRight: '8px' }} />
                定義されたプロパティ ({propFields.length})
              </h3>
              <button
                style={styles.generateButton}
                onClick={generateComponentCode}
                disabled={!componentName}
              >
                コード生成
              </button>
            </div>

            <p style={styles.helpText}>
              プロパティは任意です。静的コンポーネントの場合、プロパティなしでもコード生成できます。動的な値を設定したい場合、コードのチェックボックスを選択してプロパティを定義してください
            </p>

            {/* バリデーション結果表示 */}
            {validationResult && propFields.length > 0 && (
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: validationResult.isValid ? '#f0fdf4' : '#fef2f2',
                borderRadius: '6px',
                border: `1px solid ${validationResult.isValid ? '#bbf7d0' : '#fecaca'}`,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: validationResult.errors.length > 0 || validationResult.warnings.length > 0 ? '8px' : '0',
                }}>
                  {validationResult.isValid ? (
                    <Check size={16} color="#10b981" />
                  ) : (
                    <AlertTriangle size={16} color="#ef4444" />
                  )}
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: validationResult.isValid ? '#15803d' : '#dc2626',
                  }}>
                    {validationResult.isValid ? 'プロパティは正常です' : 'プロパティに問題があります'}
                  </span>
                </div>
                {validationResult.errors.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#dc2626', margin: '0 0 4px 0' }}>
                      エラー ({validationResult.errors.length}件):
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#991b1b' }}>
                      {validationResult.errors.map((error, idx) => (
                        <li key={idx}>{error.fieldName}: {error.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {validationResult.warnings.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#d97706', margin: '0 0 4px 0' }}>
                      警告({validationResult.warnings.length}件):
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#92400e' }}>
                      {validationResult.warnings.map((warning, idx) => (
                        <li key={idx}>{warning.fieldName}: {warning.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {propFields.length === 0 ? (
              <div style={styles.emptyState}>
                <p>プロパティが定義されていません</p>
                <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>
                  プロパティなしで静的なコンポーネントとして生成することもできます
                  動的な値を設定したい場合、HTMLコードでチェックボックスを選択してプロパティを追加してください
                </p>
              </div>
            ) : (
              <div style={styles.propsList}>
                {propFields.map((field) => {
                  const sameElementProps = propFields.filter(
                    p => p.elementPath === field.elementPath && p.id !== field.id
                  );
                  
                  // 配列に統合されたフィールドプロパティかどうか
                  const isArrayField = field.arrayParentId !== undefined;
                  const arrayParent = isArrayField ? propFields.find(f => f.id === field.arrayParentId) : null;
                  
                  // この配列プロパティに統合されたフィールドプロパティ
                  const arrayChildFields = propFields.filter(f => f.arrayParentId === field.id);

                  return (
                    <div key={field.id} style={styles.propCard}>
                      <div style={styles.propCardHeader}>
                        <div style={styles.propBadge}>
                          {isArrayField ? `配列フィールド(${field.arrayFieldName})` : field.type}
                        </div>
                        <span style={styles.propName}>
                          {isArrayField 
                            ? `配列 "${arrayParent?.name || 'unknown'}" のフィールド"${field.arrayFieldName || field.name}"`
                            : `data-prop="${field.name}"`}
                        </span>
                        <button
                          style={styles.deleteButton}
                          onClick={() => removePropField(field.id)}
                          title="削除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {isArrayField && arrayParent && (
                        <div style={{
                          padding: '8px',
                          backgroundColor: '#fef3c7',
                          borderRadius: '4px',
                          marginBottom: '12px',
                          fontSize: '11px',
                          color: '#92400e',
                        }}>
                          <strong>配列プロパティ:</strong> {arrayParent.name} ({arrayParent.label})
                        </div>
                      )}
                      {arrayChildFields.length > 0 && (
                        <div style={{
                          padding: '8px',
                          backgroundColor: '#d1fae5',
                          borderRadius: '4px',
                          marginBottom: '12px',
                          fontSize: '11px',
                          color: '#065f46',
                        }}>
                          <strong>統合されたフィールド</strong> {arrayChildFields.map(f => f.arrayFieldName || f.name).join(', ')}
                        </div>
                      )}
                      {sameElementProps.length > 0 && (
                        <div style={{
                          padding: '8px',
                          backgroundColor: '#e0f2fe',
                          borderRadius: '4px',
                          marginBottom: '12px',
                          fontSize: '11px',
                          color: '#0369a1',
                        }}>
                          <strong>同じ要素:</strong> {sameElementProps.map(p => p.name).join(', ')}
                        </div>
                      )}
                    <div style={styles.propCardBody}>
                      <div style={styles.propFieldRow}>
                        <div style={styles.propFieldHalf}>
                          <label style={styles.propLabel}>プロパティ名</label>
                          <input
                            type="text"
                            style={styles.propInput}
                            value={field.name}
                            onChange={(e) => updatePropField(field.id, { name: e.target.value })}
                          />
                        </div>
                        <div style={styles.propFieldHalf}>
                          <label style={styles.propLabel}>表示ラベル</label>
                          <input
                            type="text"
                            style={styles.propInput}
                            value={field.label}
                            onChange={(e) => updatePropField(field.id, { label: e.target.value })}
                          />
                        </div>
                      </div>
                      <div style={styles.propField}>
                        <label style={styles.propLabel}>デフォルト値</label>
                        {field.type === 'colorBoth' ? (
                          <div style={{ fontSize: '12px', color: '#6b7280', padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                            テキストカラー: {(field.defaultValue as any).color || '#000000'}<br />
                            背景カラー: {(field.defaultValue as any).backgroundColor || '#ffffff'}
                          </div>
                        ) : field.type === 'link' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                URL (href)
                              </label>
                              <input
                                type="text"
                                style={styles.propInput}
                                value={(field.defaultValue as any)?.url || ''}
                                onChange={(e) => updatePropField(field.id, { defaultValue: { ...(field.defaultValue || {}), url: e.target.value } })}
                                placeholder="https://example.com"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                テキスト
                              </label>
                              <textarea
                                style={{
                                  ...styles.propInput,
                                  minHeight: '80px',
                                  fontFamily: 'monospace',
                                  whiteSpace: 'pre-wrap',
                                }}
                                value={(field.defaultValue as any)?.text || ''}
                                onChange={(e) => updatePropField(field.id, { defaultValue: { ...(field.defaultValue || {}), text: e.target.value } })}
                                placeholder="リンクテキスト（改行可）"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                target属性
                              </label>
                              <select
                                style={styles.propInput}
                                value={(field.defaultValue as any)?.target || '_self'}
                                onChange={(e) => updatePropField(field.id, { defaultValue: { ...(field.defaultValue || {}), target: e.target.value } })}
                              >
                                <option value="_self">同じタブで開く (_self)</option>
                                <option value="_blank">新しいタブで開く (_blank)</option>
                              </select>
                            </div>
                          </div>
                        ) : field.type === 'image' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                              <label style={styles.propLabel}>画像パス</label>
                              <input
                                type="text"
                                style={styles.propInput}
                                value={(field.defaultValue as any).src || ''}
                                onChange={(e) => {
                                  const currentValue = field.defaultValue as any;
                                  const newSrc = e.target.value;
                                  
                                  let basePath = currentValue?.basePath;
                                  if (!basePath && newSrc) {
                                    const lastSlashIndex = newSrc.lastIndexOf('/');
                                    if (lastSlashIndex >= 0) {
                                      basePath = newSrc.substring(0, lastSlashIndex + 1);
                                    }
                                  }
                                  
                                  updatePropField(field.id, { 
                                    defaultValue: { 
                                      ...currentValue, 
                                      src: newSrc,
                                      basePath: basePath || undefined,
                                    } 
                                  });
                                }}
                                placeholder="/path/to/image.jpg"
                              />
                              {(field.defaultValue as any).basePath && (
                                <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>
                                  ベースパス: {(field.defaultValue as any).basePath}
                                </p>
                              )}
                            </div>
                            <div>
                              <label style={styles.propLabel}>ALTテキスト</label>
                              <textarea
                                style={{
                                  ...styles.propInput,
                                  minHeight: '60px',
                                  fontFamily: 'monospace',
                                  whiteSpace: 'pre-wrap',
                                }}
                                value={(field.defaultValue as any).alt || ''}
                                onChange={(e) => {
                                  const currentValue = field.defaultValue as any;
                                  updatePropField(field.id, { 
                                    defaultValue: { 
                                      ...currentValue, 
                                      alt: e.target.value 
                                    } 
                                  });
                                }}
                                placeholder="画像説明（改行可）"
                              />
                            </div>
                          </div>
                        ) : field.type === 'array' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(() => {
                              const arrayFieldProps = propFields.filter(f => f.arrayParentId === field.id);
                              const hasNestedFields = arrayFieldProps.length > 0;
                              const hasItems = Array.isArray(field.defaultValue) && field.defaultValue.length > 0;

                              if (!hasItems) {
                                return (
                                  <div style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', padding: '12px' }}>
                                    配列が空です
                                  </div>
                                );
                              }

                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {hasNestedFields && (
                                    <div
                                      style={{
                                        padding: '8px',
                                        backgroundColor: '#fef3c7',
                                        borderRadius: '4px',
                                        marginBottom: '8px',
                                        fontSize: '11px',
                                        color: '#92400e',
                                      }}
                                    >
                                      <strong>統合されたフィールド</strong>{' '}
                                      {arrayFieldProps.map(f => f.arrayFieldName || f.name).join(', ')}
                                    </div>
                                  )}

                                  {field.defaultValue.map((item: any, index: number) => {
                                      const isLinkItem = typeof item === 'object' && item !== null && (item.url !== undefined || item.href !== undefined);
                                      const isStringItem = typeof item === 'string';
                                      const isObjectItem = typeof item === 'object' && item !== null && !isLinkItem;
                                      
                                      return (
                                        <div
                                          key={index}
                                          style={{
                                            padding: '12px',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '6px',
                                            border: '1px solid #e5e7eb',
                                          }}
                                        >
                                          <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '8px',
                                          }}>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                                              項目 {index + 1}
                                            </span>
                                            {field.defaultValue.length > 1 && (
                                              <button
                                                onClick={() => {
                                                  const newArray = (field.defaultValue as any[]).filter((_, i) => i !== index);
                                                  updatePropField(field.id, { defaultValue: newArray });
                                                }}
                                                style={{
                                                  padding: '4px 8px',
                                                  backgroundColor: '#fee2e2',
                                                  color: '#dc2626',
                                                  border: 'none',
                                                  borderRadius: '4px',
                                                  fontSize: '11px',
                                                  cursor: 'pointer',
                                                }}
                                              >
                                                <Trash2 size={12} />
                                              </button>
                                            )}
                                          </div>
                                          
                                          {isObjectItem && hasNestedFields ? (
                                            // オブジェクト項目に統合されたフィールドがある場合
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                              {arrayFieldProps.map((fieldProp) => {
                                                const fieldName = fieldProp.arrayFieldName || fieldProp.name;
                                                const fieldValue = item[fieldName];
                                                
                                                return (
                                                  <div key={fieldProp.id}>
                                                    <label style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                                      {fieldProp.label} ({fieldName})
                                                    </label>
                                                    {fieldProp.type === 'text' || fieldProp.type === 'textarea' ? (
                                                      <textarea
                                                        style={{
                                                          ...styles.propInput,
                                                          minHeight: '60px',
                                                          fontFamily: 'monospace',
                                                          whiteSpace: 'pre-wrap',
                                                        }}
                                                        value={fieldValue || ''}
                                                        onChange={(e) => {
                                                          const newArray = [...(field.defaultValue as any[])];
                                                          newArray[index] = {
                                                            ...newArray[index],
                                                            [fieldName]: e.target.value,
                                                          };
                                                          updatePropField(field.id, { defaultValue: newArray });
                                                        }}
                                                        placeholder={`${fieldProp.label}を入力（改行可）`}
                                                      />
                                                    ) : fieldProp.type === 'color' || fieldProp.type === 'backgroundColor' ? (
                                                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                          type="color"
                                                          value={fieldValue || '#000000'}
                                                          onChange={(e) => {
                                                            const newArray = [...(field.defaultValue as any[])];
                                                            newArray[index] = {
                                                              ...newArray[index],
                                                              [fieldName]: e.target.value,
                                                            };
                                                            updatePropField(field.id, { defaultValue: newArray });
                                                          }}
                                                          style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                                                        />
                                                        <input
                                                          type="text"
                                                          style={styles.propInput}
                                                          value={fieldValue || '#000000'}
                                                          onChange={(e) => {
                                                            const newArray = [...(field.defaultValue as any[])];
                                                            newArray[index] = {
                                                              ...newArray[index],
                                                              [fieldName]: e.target.value,
                                                            };
                                                            updatePropField(field.id, { defaultValue: newArray });
                                                          }}
                                                          placeholder="#000000"
                                                        />
                                                      </div>
                                                    ) : fieldProp.type === 'colorBoth' ? (
                                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                          <label style={{ fontSize: '11px', width: '80px' }}>テキスト</label>
                                                          <input
                                                            type="color"
                                                            value={fieldValue?.color || '#000000'}
                                                            onChange={(e) => {
                                                              const newArray = [...(field.defaultValue as any[])];
                                                              newArray[index] = {
                                                                ...newArray[index],
                                                                [fieldName]: {
                                                                  ...(newArray[index][fieldName] || {}),
                                                                  color: e.target.value,
                                                                },
                                                              };
                                                              updatePropField(field.id, { defaultValue: newArray });
                                                            }}
                                                            style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                                                          />
                                                          <input
                                                            type="text"
                                                            style={{ ...styles.propInput, flex: 1 }}
                                                            value={fieldValue?.color || '#000000'}
                                                            onChange={(e) => {
                                                              const newArray = [...(field.defaultValue as any[])];
                                                              newArray[index] = {
                                                                ...newArray[index],
                                                                [fieldName]: {
                                                                  ...(newArray[index][fieldName] || {}),
                                                                  color: e.target.value,
                                                                },
                                                              };
                                                              updatePropField(field.id, { defaultValue: newArray });
                                                            }}
                                                          />
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                          <label style={{ fontSize: '11px', width: '80px' }}>背景:</label>
                                                          <input
                                                            type="color"
                                                            value={fieldValue?.backgroundColor || '#ffffff'}
                                                            onChange={(e) => {
                                                              const newArray = [...(field.defaultValue as any[])];
                                                              newArray[index] = {
                                                                ...newArray[index],
                                                                [fieldName]: {
                                                                  ...(newArray[index][fieldName] || {}),
                                                                  backgroundColor: e.target.value,
                                                                },
                                                              };
                                                              updatePropField(field.id, { defaultValue: newArray });
                                                            }}
                                                            style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                                                          />
                                                          <input
                                                            type="text"
                                                            style={{ ...styles.propInput, flex: 1 }}
                                                            value={fieldValue?.backgroundColor || '#ffffff'}
                                                            onChange={(e) => {
                                                              const newArray = [...(field.defaultValue as any[])];
                                                              newArray[index] = {
                                                                ...newArray[index],
                                                                [fieldName]: {
                                                                  ...(newArray[index][fieldName] || {}),
                                                                  backgroundColor: e.target.value,
                                                                },
                                                              };
                                                              updatePropField(field.id, { defaultValue: newArray });
                                                            }}
                                                          />
                                                        </div>
                                                      </div>
                                                    ) : fieldProp.type === 'link' ? (
                                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <input
                                                          type="text"
                                                          style={styles.propInput}
                                                          value={fieldValue?.url || ''}
                                                          onChange={(e) => {
                                                            const newArray = [...(field.defaultValue as any[])];
                                                            newArray[index] = {
                                                              ...newArray[index],
                                                              [fieldName]: {
                                                                ...(newArray[index][fieldName] || {}),
                                                                url: e.target.value,
                                                              },
                                                            };
                                                            updatePropField(field.id, { defaultValue: newArray });
                                                          }}
                                                          placeholder="https://example.com"
                                                        />
                                                        <textarea
                                                          style={{
                                                            ...styles.propInput,
                                                            minHeight: '60px',
                                                            fontFamily: 'monospace',
                                                            whiteSpace: 'pre-wrap',
                                                          }}
                                                          value={fieldValue?.text || ''}
                                                          onChange={(e) => {
                                                            const newArray = [...(field.defaultValue as any[])];
                                                            newArray[index] = {
                                                              ...newArray[index],
                                                              [fieldName]: {
                                                                ...(newArray[index][fieldName] || {}),
                                                                text: e.target.value,
                                                              },
                                                            };
                                                            updatePropField(field.id, { defaultValue: newArray });
                                                          }}
                                                            placeholder="リンクテキスト（改行可）"
                                                        />
                                                        <select
                                                          style={styles.propInput}
                                                          value={fieldValue?.target || '_self'}
                                                          onChange={(e) => {
                                                            const newArray = [...(field.defaultValue as any[])];
                                                            newArray[index] = {
                                                              ...newArray[index],
                                                              [fieldName]: {
                                                                ...(newArray[index][fieldName] || {}),
                                                                target: e.target.value,
                                                              },
                                                            };
                                                            updatePropField(field.id, { defaultValue: newArray });
                                                          }}
                                                        >
                                                          <option value="_self">同じタブで開く (_self)</option>
                                                          <option value="_blank">新しいタブで開く (_blank)</option>
                                                        </select>
                                                      </div>
                                                    ) : (
                                                      <input
                                                        type="text"
                                                        style={styles.propInput}
                                                        value={typeof fieldValue === 'string' ? fieldValue : JSON.stringify(fieldValue)}
                                                        onChange={(e) => {
                                                          const newArray = [...(field.defaultValue as any[])];
                                                          newArray[index] = {
                                                            ...newArray[index],
                                                            [fieldName]: e.target.value,
                                                          };
                                                          updatePropField(field.id, { defaultValue: newArray });
                                                        }}
                                                      />
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          ) : isLinkItem ? (
                            // リンク項目にタグを含む場合
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div>
                                          <label style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                            URL (href)
                                          </label>
                                          <input
                                            type="text"
                                            style={styles.propInput}
                                            value={item.url || item.href || ''}
                                            onChange={(e) => {
                                              const newArray = [...(field.defaultValue as any[])];
                                              newArray[index] = {
                                                ...item,
                                                url: e.target.value,
                                                href: e.target.value,
                                              };
                                              updatePropField(field.id, { defaultValue: newArray });
                                            }}
                                            placeholder="https://example.com"
                                          />
                                        </div>
                                        <div>
                                          <label style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                            テキスト
                                          </label>
                                          <textarea
                                            style={{
                                              ...styles.propInput,
                                              minHeight: '60px',
                                              fontFamily: 'monospace',
                                              whiteSpace: 'pre-wrap',
                                            }}
                                            value={item.text || ''}
                                            onChange={(e) => {
                                              const newArray = [...(field.defaultValue as any[])];
                                              newArray[index] = {
                                                ...item,
                                                text: e.target.value,
                                              };
                                              updatePropField(field.id, { defaultValue: newArray });
                                            }}
                                            placeholder="リンクテキスト（改行可）"
                                          />
                                        </div>
                                        <div>
                                          <label style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                            target属性
                                          </label>
                                          <select
                                            style={styles.propInput}
                                            value={item.target || '_self'}
                                            onChange={(e) => {
                                              const newArray = [...(field.defaultValue as any[])];
                                              newArray[index] = {
                                                ...item,
                                                target: e.target.value,
                                              };
                                              updatePropField(field.id, { defaultValue: newArray });
                                            }}
                                          >
                                            <option value="_self">同じタブで開く (_self)</option>
                                            <option value="_blank">新しいタブで開く (_blank)</option>
                                          </select>
                                        </div>
                                      </div>
                                    ) : isStringItem ? (
                                      // 文字列項目
                                      <textarea
                                        style={{
                                          ...styles.propInput,
                                          minHeight: '60px',
                                          fontFamily: 'monospace',
                                          whiteSpace: 'pre-wrap',
                                        }}
                                        value={item}
                                        onChange={(e) => {
                                          const newArray = [...(field.defaultValue as any[])];
                                          newArray[index] = e.target.value;
                                          updatePropField(field.id, { defaultValue: newArray });
                                        }}
                                        placeholder="テキストを入力（改行可）"
                                      />
                                    ) : (
                                      // その他のオブジェクト項目
                                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                        {JSON.stringify(item, null, 2)}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              <button
                                onClick={() => {
                                  const currentArray = Array.isArray(field.defaultValue) ? [...field.defaultValue] : [];
                                  const arrayFieldPropsForAdd = propFields.filter(f => f.arrayParentId === field.id);
                                  
                                  let newItem: any;
                                  
                                  if (arrayFieldPropsForAdd.length > 0) {
                                    newItem = {};
                                    arrayFieldPropsForAdd.forEach(fieldProp => {
                                      const fieldName = fieldProp.arrayFieldName || fieldProp.name;
                                      const defaultValue = fieldProp.defaultValue;
                                      newItem[fieldName] = defaultValue;
                                    });
                                  } else {
                                    const lastItem = currentArray.length > 0 ? currentArray[currentArray.length - 1] : null;
                                    
                                    if (lastItem && typeof lastItem === 'object' && (lastItem.url !== undefined || lastItem.href !== undefined)) {
                                      newItem = { url: '', text: '', target: '_self' };
                                    } else if (lastItem && typeof lastItem === 'object') {
                                      newItem = { ...lastItem };
                                    } else {
                                      newItem = '新しい項目';
                                    }
                                  }
                                  
                                  updatePropField(field.id, { defaultValue: [...currentArray, newItem] });
                                }}
                                style={{
                                  padding: '8px 12px',
                                  backgroundColor: '#3b82f6',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                }}
                              >
                                <Plus size={14} />
                                項目を追加
                              </button>
                            </div>
                          );
                        })()}
                          </div>
                        ) : field.type === 'text' || field.type === 'textarea' ? (
                          <textarea
                            style={{
                              ...styles.propInput,
                              minHeight: '80px',
                              fontFamily: 'monospace',
                              lineHeight: '1.4',
                              resize: 'vertical',
                              whiteSpace: 'pre-wrap',
                            }}
                            value={typeof field.defaultValue === 'string' ? field.defaultValue : ''}
                            onChange={(e) => updatePropField(field.id, { defaultValue: e.target.value })}
                              placeholder="改行を含むテキストを入力できます"
                          />
                        ) : (
                          <input
                            type="text"
                            style={styles.propInput}
                            value={typeof field.defaultValue === 'object' ? JSON.stringify(field.defaultValue) : field.defaultValue}
                            onChange={(e) => updatePropField(field.id, { defaultValue: e.target.value })}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {generatedCode && (
          <div style={styles.codeSection}>
            <div style={styles.codeSectionHeader}>
              <h3 style={styles.sectionTitle}>生成されたコード</h3>
              <div style={styles.codeActions}>
                <button
                  style={styles.iconButton}
                  onClick={copyToClipboard}
                  title="コピー"
                >
                  {isCodeCopied ? <Check size={16} /> : <Copy size={16} />}
                  {isCodeCopied ? 'コピー完了' : 'コピー'}
                </button>
                <button
                  style={styles.iconButton}
                  onClick={downloadCode}
                  title="ダウンロード"
                >
                  <Download size={16} />
                  ダウンロード
                </button>
              </div>
            </div>
            <pre style={styles.codeBlock}>
              <code>{generatedCode}</code>
            </pre>

            <div style={styles.saveSection}>
              <button
                style={{ ...styles.saveButton, ...(isSaved ? styles.savedButton : {}) }}
                onClick={saveComponentAndCreateFiles}
                disabled={isSaved}
              >
                {isSaved ? (
                  <>
                    <Check size={16} />
                    追加完了
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    コンポーネント追加
                  </>
                )}
              </button>
              <p style={styles.saveHint}>
                追加後、コンポーネントライブラリに表示されます
              </p>
            </div>
          </div>
        )}
      </div>

      {showPropModal && (
        <div style={styles.modalOverlay} onClick={() => {
          setShowPropModal(false);
          setSelectedChildIndex(-1);
          setChildTags([]);
        }}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>プロパティを定義</h3>

            <div style={styles.modalContent}>
              <div style={styles.selectedTextPreview}>
                <label style={styles.modalLabel}>選択されたタグ:</label>
                <div style={styles.selectedTextBox}>
                  {selectedTagIndex !== null && selectedTagIndex >= 0 && parsedTags[selectedTagIndex] && (
                    <span style={{ fontFamily: 'monospace', color: '#3b82f6', fontWeight: 'bold' }}>
                      &lt;{parsedTags[selectedTagIndex].tagName}&gt;
                    </span>
                  )}
                </div>
              </div>

              {childTags.length > 0 && (
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>対象要素を選択</label>
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      backgroundColor: selectedChildIndex === -1 ? '#dbeafe' : 'transparent',
                      marginBottom: '4px',
                    }}>
                      <input
                        type="radio"
                        checked={selectedChildIndex === -1}
                        onChange={() => setSelectedChildIndex(-1)}
                        style={{ marginRight: '8px' }}
                      />
                      <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                        {selectedTagIndex !== null && selectedTagIndex >= 0 && parsedTags[selectedTagIndex] && (
                          <>
                            &lt;{parsedTags[selectedTagIndex].tagName}&gt;
                            {(() => {
                              const className = extractClassName(parsedTags[selectedTagIndex].fullElement);
                              return className ? ` (${className})` : '';
                            })()} (親要素)
                          </>
                        )}
                      </span>
                    </label>
                    {childTags.map((childTag, index) => (
                      <label
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          backgroundColor: selectedChildIndex === index ? '#dbeafe' : 'transparent',
                          marginBottom: '4px',
                        }}
                      >
                        <input
                          type="radio"
                          checked={selectedChildIndex === index}
                          onChange={() => setSelectedChildIndex(index)}
                          style={{ marginRight: '8px' }}
                        />
                        <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                          &lt;{childTag.tagName}&gt;
                          {(() => {
                            const className = extractClassName(childTag.fullElement);
                            return className ? ` (${className})` : '';
                          })()}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px', marginBottom: 0 }}>
                    {selectedChildIndex === -1 
                      ? '親タグ全体にプロパティが適用されます'
                      : (() => {
                          const selectedChild = childTags[selectedChildIndex];
                          const className = selectedChild ? extractClassName(selectedChild.fullElement) : null;
                          const displayName = className 
                            ? `&lt;${selectedChild.tagName}&gt; (${className})`
                            : `&lt;${selectedChild.tagName}&gt;`;
                          return `子タグ、${displayName}にプロパティが適用されます`;
                        })()}
                  </p>
                </div>
              )}

              {childTags.length === 0 && (
                <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px', marginBottom: '16px' }}>
                  このタグの要素全体にプロパティが適用されます
                </p>
              )}

              <div style={styles.modalField}>
                <label style={styles.modalLabel}>プロパティタイプを選択</label>
                <select
                  style={styles.modalInput}
                  value={newPropType}
                  onChange={(e) => setNewPropType(e.target.value as PropField['type'])}
                  autoFocus
                >
                  <option value="text">① テキスト編集（改行可）</option>
                  <option value="link">② リンク編集</option>
                  <option value="image">③ 画像編集（&amp;D対応！）</option>
                  <option value="color">④ テキストカラーのみ</option>
                  <option value="backgroundColor">④ 背景カラーのみ</option>
                  <option value="colorBoth">④ テキスト！背景カラー両方</option>
                  <option value="array">⑤ 配列（i要素など）</option>
                  <option value="visibility">⑥ 表示/非表示</option>
                </select>
                <p style={styles.modalHint}>
                  {selectedTagIndex !== null && selectedTagIndex >= 0 && parsedTags[selectedTagIndex] && (() => {
                    const targetTagName = selectedChildIndex >= 0 && childTags[selectedChildIndex]
                      ? childTags[selectedChildIndex].tagName
                      : parsedTags[selectedTagIndex].tagName;
                    return (
                      <>
                        <strong>推奨:</strong>
                        {targetTagName === 'a' && ' ② リンク編集'}
                        {targetTagName === 'img' && ' ③ 画像編集（&amp;D対応！）'}
                        {targetTagName === 'ul' && ' ⑤ 配列（i要素など）'}
                        {targetTagName === 'ol' && ' ⑤ 配列（i要素など）'}
                        {!['a', 'img', 'ul', 'ol'].includes(targetTagName) &&
                          ' ① テキスト編集（改行可）または ④ カラー編集'}
                      </>
                    );
                  })()}
                </p>
              </div>

              {selectedTagIndex !== null && selectedTagIndex >= 0 && parsedTags[selectedTagIndex] && (() => {
                const targetTag = selectedChildIndex >= 0 && childTags[selectedChildIndex] 
                  ? childTags[selectedChildIndex] 
                  : parsedTags[selectedTagIndex];
                const parentArrayIndex = selectedTagIndex !== null ? findParentArrayElement(selectedTagIndex) : null;
                const canBeArrayField = parentArrayIndex !== null && 
                                        newPropType !== 'array' && 
                                        (parsedTags[selectedTagIndex].tagName === 'li' || 
                                         (selectedChildIndex >= 0 && childTags[selectedChildIndex]?.tagName === 'li'));
                
                return (
                  <>
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '6px',
                      border: '1px solid #bbf7d0',
                      marginTop: '12px',
                    }}>
                      <p style={{ fontSize: '12px', color: '#15803d', margin: '0 0 4px 0', fontWeight: 'bold' }}>
                        自動生成されるプロパティ名
                      </p>
                      <p style={{ fontSize: '13px', color: '#166534', margin: 0, fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {generatePropertyName(targetTag.tagName, newPropType)}
                      </p>
                    </div>
                    
                    {/* 配列統合オプション */}
                    {canBeArrayField && (
                      <div style={{
                        padding: '12px',
                        backgroundColor: '#fef3c7',
                        borderRadius: '6px',
                        border: '1px solid #fde68a',
                        marginTop: '12px',
                      }}>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          marginBottom: isArrayField ? '12px' : '0',
                        }}>
                          <input
                            type="checkbox"
                            checked={isArrayField}
                            onChange={(e) => {
                              setIsArrayField(e.target.checked);
                              if (!e.target.checked) {
                                setArrayParentName('');
                                setArrayFieldName('');
                              } else {
                                // 既存の配列プロパティを検索
                                const parentTag = parsedTags[parentArrayIndex!];
                                const existingArrayProp = propFields.find(f => 
                                  f.type === 'array' && 
                                  f.position && 
                                  f.position.start === parentTag.position.start
                                );
                                if (existingArrayProp) {
                                  setArrayParentName(existingArrayProp.name);
                                } else {
                                  // 新しい配列プロパティ名を生成
                                  const newArrayName = generatePropertyName('ul', 'array');
                                  setArrayParentName(newArrayName);
                                }
                                // フィールド名を動的生成（name, price, backgroundColor）
                                const fieldName = generatePropertyName(targetTag.tagName, newPropType)
                                  .replace(/_\d+_/, '_')
                                  .replace(/_text$/, '')
                                  .replace(/_link$/, '')
                                  .replace(/_image$/, '')
                                  .replace(/_color$/, '')
                                  .replace(/_bg_color$/, '')
                                  .replace(/_color_both$/, '');
                                setArrayFieldName(fieldName);
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '13px', fontWeight: '500', color: '#92400e' }}>
                            配列項目のフィールドとして統合
                          </span>
                        </label>
                        {isArrayField && (
                          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>
                              <label style={{ fontSize: '12px', fontWeight: '500', color: '#92400e', display: 'block', marginBottom: '4px' }}>
                                配列プロパティ名
                              </label>
                              <input
                                type="text"
                                value={arrayParentName}
                                onChange={(e) => setArrayParentName(e.target.value)}
                                style={styles.modalInput}
                                placeholder="additionalPlans"
                              />
                              <p style={{ fontSize: '11px', color: '#a16207', marginTop: '4px', marginBottom: 0 }}>
                                既存の配列プロパティに統合する場合、その名前を入力してください
                              </p>
                            </div>
                            <div>
                              <label style={{ fontSize: '12px', fontWeight: '500', color: '#92400e', display: 'block', marginBottom: '4px' }}>
                                フィールド名（配列項目の名前）
                              </label>
                              <input
                                type="text"
                                value={arrayFieldName}
                                onChange={(e) => setArrayFieldName(e.target.value)}
                                style={styles.modalInput}
                                placeholder="name, price, backgroundColor"
                              />
                              <p style={{ fontSize: '11px', color: '#a16207', marginTop: '4px', marginBottom: 0 }}>
                                配列の項目に使用されるフィールド名（name, price, backgroundColor）
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <div style={styles.modalActions}>
              <button
                style={styles.modalCancelButton}
                onClick={() => {
                  setShowPropModal(false);
                  setSelectedChildIndex(-1);
                  setChildTags([]);
                }}
              >
                キャンセル
              </button>
              <button
                style={styles.modalSaveButton}
                onClick={addPropertyFromSelection}
              >
                プロパティを追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* バージョン履歴モーダル */}
      {showVersionHistory && (
        <div style={styles.modalOverlay} onClick={() => setShowVersionHistory(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>
              <History size={20} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />
              バージョン履歴
            </h3>
            <div style={styles.modalContent}>
              {versionHistory.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>バージョン履歴がありません</p>
              ) : (
                <div style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                }}>
                  {versionHistory.map((version) => (
                    <div
                      key={version.id}
                      style={{
                        padding: '12px',
                        marginBottom: '8px',
                        backgroundColor: version.isDraft ? '#fef3c7' : '#d1fae5',
                        borderRadius: '6px',
                        border: `1px solid ${version.isDraft ? '#fde68a' : '#a7f3d0'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                            バージョン {version.version}
                          </span>
                          {version.isDraft ? (
                            <span style={{
                              padding: '2px 8px',
                              backgroundColor: '#fbbf24',
                              color: '#78350f',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                            }}>
                              ドラフト
                            </span>
                          ) : (
                            <span style={{
                              padding: '2px 8px',
                              backgroundColor: '#10b981',
                              color: '#064e3b',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                            }}>
                              リリース
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                          {new Date(version.createdAt).toLocaleString('ja-JP')}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const metadata = generateComponentMetadata(
                            isNewCategory ? newCategoryName : category,
                            isNewCategory ? newCategoryRomanized : categoryRomanized,
                            componentName
                          );
                          loadVersion(metadata.uniqueId, version.version);
                          setShowVersionHistory(false);
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        読み込む
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={styles.modalActions}>
              <button
                style={styles.modalCancelButton}
                onClick={() => setShowVersionHistory(false)}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentBuilder;