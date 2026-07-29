import React, { useState } from 'react';
import { Plus, X, ChevronDown, ChevronUp, Tag, Ruler, Palette, Box } from 'lucide-react';

export interface ProductAttribute {
  id: string;
  name: string;
  values: string[];
}

export interface ProductAttributesData {
  specifications: ProductAttribute[];  // 规格
  materials: ProductAttribute[];         // 材质
  colors: ProductAttribute[];            // 颜色
  features: string[];                    // 产品特点
  techParams: { name: string; value: string }[];  // 技术参数
  applications: string[];              // 应用领域
}

interface ProductAttributesProps {
  data: ProductAttributesData;
  onChange: (data: ProductAttributesData) => void;
}

const defaultData: ProductAttributesData = {
  specifications: [],
  materials: [],
  colors: [],
  features: [],
  techParams: [],
  applications: []
};

export const ProductAttributes: React.FC<ProductAttributesProps> = ({
  data,
  onChange
}) => {
  const attributes = { ...defaultData, ...data };
  const [expanded, setExpanded] = useState<string[]>(['specifications', 'features']);
  const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({});

  const toggleSection = (section: string) => {
    setExpanded(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const updateData = (key: keyof ProductAttributesData, value: any) => {
    onChange({ ...attributes, [key]: value });
  };

  // 添加属性组
  const addAttributeGroup = (type: 'specifications' | 'materials' | 'colors') => {
    const name = newItemInputs[`${type}_name`]?.trim();
    if (!name) return;

    const newAttr: ProductAttribute = {
      id: `${type}_${Date.now()}`,
      name,
      values: []
    };
    updateData(type, [...attributes[type], newAttr]);
    setNewItemInputs(prev => ({ ...prev, [`${type}_name`]: '' }));
  };

  // 删除属性组
  const removeAttributeGroup = (type: 'specifications' | 'materials' | 'colors', id: string) => {
    updateData(type, attributes[type].filter(attr => attr.id !== id));
  };

  // 添加属性值
  const addAttributeValue = (type: 'specifications' | 'materials' | 'colors', attrId: string) => {
    const value = newItemInputs[`${type}_${attrId}_value`]?.trim();
    if (!value) return;

    const updated = attributes[type].map(attr => 
      attr.id === attrId 
        ? { ...attr, values: [...attr.values, value] }
        : attr
    );
    updateData(type, updated);
    setNewItemInputs(prev => ({ ...prev, [`${type}_${attrId}_value`]: '' }));
  };

  // 删除属性值
  const removeAttributeValue = (type: 'specifications' | 'materials' | 'colors', attrId: string, value: string) => {
    const updated = attributes[type].map(attr => 
      attr.id === attrId 
        ? { ...attr, values: attr.values.filter(v => v !== value) }
        : attr
    );
    updateData(type, updated);
  };

  // 添加简单项
  const addSimpleItem = (type: 'features' | 'applications') => {
    const value = newItemInputs[type]?.trim();
    if (!value) return;

    updateData(type, [...attributes[type], value]);
    setNewItemInputs(prev => ({ ...prev, [type]: '' }));
  };

  // 删除简单项
  const removeSimpleItem = (type: 'features' | 'applications', index: number) => {
    const updated = [...attributes[type]];
    updated.splice(index, 1);
    updateData(type, updated);
  };

  // 添加技术参数
  const addTechParam = () => {
    const name = newItemInputs['techParam_name']?.trim();
    const value = newItemInputs['techParam_value']?.trim();
    if (!name || !value) return;

    updateData('techParams', [...attributes.techParams, { name, value }]);
    setNewItemInputs(prev => ({ ...prev, techParam_name: '', techParam_value: '' }));
  };

  // 删除技术参数
  const removeTechParam = (index: number) => {
    const updated = [...attributes.techParams];
    updated.splice(index, 1);
    updateData('techParams', updated);
  };

  const SectionHeader = ({ title, icon: Icon, section }: { title: string; icon: any; section: string }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-gray-700">{title}</span>
        <span className="text-xs text-gray-400">
          {section === 'specifications' && `(${attributes.specifications.length}组)`}
          {section === 'materials' && `(${attributes.materials.length}组)`}
          {section === 'colors' && `(${attributes.colors.length}组)`}
          {section === 'features' && `(${attributes.features.length}个)`}
          {section === 'techParams' && `(${attributes.techParams.length}项)`}
          {section === 'applications' && `(${attributes.applications.length}个)`}
        </span>
      </div>
      {expanded.includes(section) ? (
        <ChevronUp className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="space-y-3">
      {/* 规格 */}
      <div className="border rounded-lg overflow-hidden">
        <SectionHeader title="产品规格" icon={Ruler} section="specifications" />
        {expanded.includes('specifications') && (
          <div className="p-4 space-y-3">
            {attributes.specifications.map((spec) => (
              <div key={spec.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{spec.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttributeGroup('specifications', spec.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {spec.values.map((value, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                    >
                      {value}
                      <button
                        type="button"
                        onClick={() => removeAttributeValue('specifications', spec.id, value)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItemInputs[`specifications_${spec.id}_value`] || ''}
                    onChange={(e) => setNewItemInputs(prev => ({ ...prev, [`specifications_${spec.id}_value`]: e.target.value }))}
                    placeholder="添加规格值"
                    className="flex-1 px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttributeValue('specifications', spec.id))}
                  />
                  <button
                    type="button"
                    onClick={() => addAttributeValue('specifications', spec.id)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemInputs['specifications_name'] || ''}
                onChange={(e) => setNewItemInputs(prev => ({ ...prev, specifications_name: e.target.value }))}
                placeholder="添加规格类别（如：克重、幅宽）"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttributeGroup('specifications'))}
              />
              <button
                type="button"
                onClick={() => addAttributeGroup('specifications')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 材质 */}
      <div className="border rounded-lg overflow-hidden">
        <SectionHeader title="材质成分" icon={Box} section="materials" />
        {expanded.includes('materials') && (
          <div className="p-4 space-y-3">
            {attributes.materials.map((material) => (
              <div key={material.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{material.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttributeGroup('materials', material.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {material.values.map((value, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm"
                    >
                      {value}
                      <button
                        type="button"
                        onClick={() => removeAttributeValue('materials', material.id, value)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItemInputs[`materials_${material.id}_value`] || ''}
                    onChange={(e) => setNewItemInputs(prev => ({ ...prev, [`materials_${material.id}_value`]: e.target.value }))}
                    placeholder="添加材质值"
                    className="flex-1 px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttributeValue('materials', material.id))}
                  />
                  <button
                    type="button"
                    onClick={() => addAttributeValue('materials', material.id)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemInputs['materials_name'] || ''}
                onChange={(e) => setNewItemInputs(prev => ({ ...prev, materials_name: e.target.value }))}
                placeholder="添加材质类别（如：主料、辅料）"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttributeGroup('materials'))}
              />
              <button
                type="button"
                onClick={() => addAttributeGroup('materials')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 颜色 */}
      <div className="border rounded-lg overflow-hidden">
        <SectionHeader title="颜色选项" icon={Palette} section="colors" />
        {expanded.includes('colors') && (
          <div className="p-4 space-y-3">
            {attributes.colors.map((color) => (
              <div key={color.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{color.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttributeGroup('colors', color.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {color.values.map((value, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm"
                    >
                      {value}
                      <button
                        type="button"
                        onClick={() => removeAttributeValue('colors', color.id, value)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItemInputs[`colors_${color.id}_value`] || ''}
                    onChange={(e) => setNewItemInputs(prev => ({ ...prev, [`colors_${color.id}_value`]: e.target.value }))}
                    placeholder="添加颜色值"
                    className="flex-1 px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttributeValue('colors', color.id))}
                  />
                  <button
                    type="button"
                    onClick={() => addAttributeValue('colors', color.id)}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemInputs['colors_name'] || ''}
                onChange={(e) => setNewItemInputs(prev => ({ ...prev, colors_name: e.target.value }))}
                placeholder="添加颜色类别（如：标准色、定制色）"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttributeGroup('colors'))}
              />
              <button
                type="button"
                onClick={() => addAttributeGroup('colors')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 产品特点 */}
      <div className="border rounded-lg overflow-hidden">
        <SectionHeader title="产品特点" icon={Tag} section="features" />
        {expanded.includes('features') && (
          <div className="p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {attributes.features.map((feature, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeSimpleItem('features', idx)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemInputs['features'] || ''}
                onChange={(e) => setNewItemInputs(prev => ({ ...prev, features: e.target.value }))}
                placeholder="添加产品特点（如：防水透气、防油防污）"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSimpleItem('features'))}
              />
              <button
                type="button"
                onClick={() => addSimpleItem('features')}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 技术参数 */}
      <div className="border rounded-lg overflow-hidden">
        <SectionHeader title="技术参数" icon={Ruler} section="techParams" />
        {expanded.includes('techParams') && (
          <div className="p-4 space-y-3">
            {attributes.techParams.map((param, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                <span className="flex-1 font-medium text-gray-700">{param.name}</span>
                <span className="flex-1 text-gray-600">{param.value}</span>
                <button
                  type="button"
                  onClick={() => removeTechParam(idx)}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemInputs['techParam_name'] || ''}
                onChange={(e) => setNewItemInputs(prev => ({ ...prev, techParam_name: e.target.value }))}
                placeholder="参数名称（如：防水等级）"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                value={newItemInputs['techParam_value'] || ''}
                onChange={(e) => setNewItemInputs(prev => ({ ...prev, techParam_value: e.target.value }))}
                placeholder="参数值（如：≥10000mm）"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechParam())}
              />
              <button
                type="button"
                onClick={addTechParam}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 应用领域 */}
      <div className="border rounded-lg overflow-hidden">
        <SectionHeader title="应用领域" icon={Tag} section="applications" />
        {expanded.includes('applications') && (
          <div className="p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {attributes.applications.map((app, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                >
                  {app}
                  <button
                    type="button"
                    onClick={() => removeSimpleItem('applications', idx)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemInputs['applications'] || ''}
                onChange={(e) => setNewItemInputs(prev => ({ ...prev, applications: e.target.value }))}
                placeholder="添加应用领域（如：户外工作服、医疗防护服）"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSimpleItem('applications'))}
              />
              <button
                type="button"
                onClick={() => addSimpleItem('applications')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductAttributes;
