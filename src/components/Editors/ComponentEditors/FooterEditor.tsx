// フッターコンポーネントのエディタ

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { BaseEditorProps, useBaseEditor } from './BaseEditor';

export const FooterEditor: React.FC<BaseEditorProps> = (props) => {
  const { component, styles, handlePropChange, handleStyleChange, handleFocus, handleBlur } = useBaseEditor(props);

  const handleLinkChange = (index: number, field: string, value: string) => {
    const newLinks = [...(component.props.links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    handlePropChange('links', newLinks);
  };

  const handleSocialLinkChange = (index: number, field: string, value: string) => {
    const newSocialLinks = [...(component.props.socialLinks || [])];
    newSocialLinks[index] = { ...newSocialLinks[index], [field]: value };
    handlePropChange('socialLinks', newSocialLinks);
  };

  const addLink = () => {
    const newLinks = [...(component.props.links || [])];
    newLinks.push({ label: 'New Link', url: '#' });
    handlePropChange('links', newLinks);
  };

  const removeLink = (index: number) => {
    const newLinks = [...(component.props.links || [])];
    newLinks.splice(index, 1);
    handlePropChange('links', newLinks);
  };

  const addSocialLink = () => {
    const newSocialLinks = [...(component.props.socialLinks || [])];
    newSocialLinks.push({ platform: 'Twitter', url: '#' });
    handlePropChange('socialLinks', newSocialLinks);
  };

  const removeSocialLink = (index: number) => {
    const newSocialLinks = [...(component.props.socialLinks || [])];
    newSocialLinks.splice(index, 1);
    handlePropChange('socialLinks', newSocialLinks);
  };

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Company Info</h3>

        <div style={styles.field}>
          <label style={styles.label}>Company Name</label>
          <input
            type="text"
            value={component.props.companyName || ''}
            onChange={(e) => handlePropChange('companyName', e.target.value)}
            style={styles.input}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Description</label>
          <textarea
            value={component.props.description || ''}
            onChange={(e) => handlePropChange('description', e.target.value)}
            rows={3}
            style={styles.textarea}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Copyright Text</label>
          <input
            type="text"
            value={component.props.copyright || ''}
            onChange={(e) => handlePropChange('copyright', e.target.value)}
            style={styles.input}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>

      <div style={styles.section}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={styles.sectionTitle}>Quick Links</h3>
          <button
            onClick={addLink}
            style={styles.addButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <Plus size={12} style={{ marginRight: '4px' }} />
            Add
          </button>
        </div>

        <div>
          {(component.props.links || []).map((link: any, index: number) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={link.label || ''}
                onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                placeholder="Link text"
                style={{ ...styles.input, flex: 1 }}
              />
              <input
                type="url"
                value={link.url || ''}
                onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                placeholder="URL"
                style={{ ...styles.input, flex: 1 }}
              />
              <button
                onClick={() => removeLink(index)}
                style={styles.deleteButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={styles.sectionTitle}>Social Links</h3>
          <button
            onClick={addSocialLink}
            style={styles.addButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <Plus size={12} style={{ marginRight: '4px' }} />
            Add
          </button>
        </div>

        <div>
          {(component.props.socialLinks || []).map((social: any, index: number) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <select
                value={social.platform || ''}
                onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                style={{ ...styles.input, flex: 1 }}
              >
                <option value="Twitter">Twitter</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
              </select>
              <input
                type="url"
                value={social.url || ''}
                onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                placeholder="URL"
                style={{ ...styles.input, flex: 1 }}
              />
              <button
                onClick={() => removeSocialLink(index)}
                style={styles.deleteButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Style</h3>

        <div style={styles.field}>
          <label style={styles.label}>Theme</label>
          <select
            value={component.style?.theme || 'dark'}
            onChange={(e) => handleStyleChange('theme', e.target.value)}
            style={styles.input}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>
    </div>
  );
};
