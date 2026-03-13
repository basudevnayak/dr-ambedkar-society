// lib/fetcher.js
class DropdownFetcher {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  // Generic fetch method
  async fetch(url, options = {}) {
    const response = await fetch(`${this.baseURL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  }

  // Dropdown CRUD operations
  async getAllDropdowns(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/dropdowns${queryString ? `?${queryString}` : ''}`;
    const response = await this.fetch(url);
    return response.data;
  }

  async getDropdownById(id) {
    const response = await this.fetch(`/api/dropdowns/${id}`);
    return response.data;
  }

  async createDropdown(data) {
    const response = await this.fetch('/api/dropdowns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateDropdown(id, data) {
    const response = await this.fetch(`/api/dropdowns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteDropdown(id) {
    const response = await this.fetch(`/api/dropdowns/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  // Option operations
  async getDropdownOptions(dropdownId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/dropdowns/${dropdownId}/options${queryString ? `?${queryString}` : ''}`;
    const response = await this.fetch(url);
    return response.data;
  }

  async createOption(dropdownId, data) {
    const response = await this.fetch(`/api/dropdowns/${dropdownId}/options`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async getOptionById(dropdownId, optionId) {
    const response = await this.fetch(`/api/dropdowns/${dropdownId}/options/${optionId}`);
    return response.data;
  }

  async updateOption(dropdownId, optionId, data) {
    const response = await this.fetch(`/api/dropdowns/${dropdownId}/options/${optionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteOption(dropdownId, optionId) {
    const response = await this.fetch(`/api/dropdowns/${dropdownId}/options/${optionId}`, {
      method: 'DELETE',
    });
    return response;
  }

  // Bulk operations
  async bulkCreateOptions(dropdownId, options) {
    const results = [];
    for (const option of options) {
      const result = await this.createOption(dropdownId, option);
      results.push(result);
    }
    return results;
  }

  async reorderOptions(dropdownId, optionOrders) {
    // optionOrders: [{ id: 'optionId', order: 1 }]
    const updates = optionOrders.map(({ id, order }) =>
      this.updateOption(dropdownId, id, { order })
    );
    return Promise.all(updates);
  }

  // Search and filter
  async searchDropdowns(searchTerm) {
    const allDropdowns = await this.getAllDropdowns();
    return allDropdowns.filter(d => 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  async getDropdownsByType(type) {
    return this.getAllDropdowns({ type });
  }

  async getActiveDropdowns() {
    return this.getAllDropdowns({ isActive: true });
  }

  // Utility methods
  async getOptionPath(dropdownId, optionId) {
    const option = await this.getOptionById(dropdownId, optionId);
    return option.path;
  }

  async getChildOptions(dropdownId, parentId) {
    const { tree } = await this.getDropdownOptions(dropdownId, { parentId });
    return tree;
  }

  async getAllDescendants(dropdownId, optionId) {
    const option = await this.getOptionById(dropdownId, optionId);
    const { tree } = await this.getDropdownOptions(dropdownId);
    
    const findDescendants = (options, targetId) => {
      for (const opt of options) {
        if (opt._id === targetId) {
          return opt.children || [];
        }
        if (opt.children) {
          const found = findDescendants(opt.children, targetId);
          if (found) return found;
        }
      }
      return [];
    };
    
    return findDescendants(tree, optionId);
  }
}

// Create and export a singleton instance
const dropdownFetcher = new DropdownFetcher();
export default dropdownFetcher;