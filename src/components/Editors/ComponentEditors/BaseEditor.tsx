// ベースエディタ - 共通機能を提供

import React from 'react';
import { ComponentData } from '../../../types';
import { editorStyles } from '../shared/editorStyles';
import { createFocusHandler, createBlurHandler } from '../shared/editorUtils';

export interface BaseEditorProps {
  component: ComponentData;
  onPropChange: (key: string, value: any) => void;
  onStyleChange: (key: string, value: any) => void;
}

export interface EditorContext {
  component: ComponentData;
  styles: typeof editorStyles;
  handlePropChange: (key: string, value: any) => void;
  handleStyleChange: (key: string, value: any) => void;
  handleFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

/**
 * ベースエディタ - 共通機能を提供するヘルパー関数
 */
export const useBaseEditor = (props: BaseEditorProps): EditorContext => {
  const handleFocus = createFocusHandler();
  const handleBlur = createBlurHandler();

  return {
    component: props.component,
    styles: editorStyles,
    handlePropChange: props.onPropChange,
    handleStyleChange: props.onStyleChange,
    handleFocus,
    handleBlur,
  };
};
