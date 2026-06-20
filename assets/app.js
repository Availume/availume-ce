import './stimulus_bootstrap.js';

const setNavigationState = (isOpen) => {
    document.body.classList.toggle('nav-open', isOpen);

    document.querySelectorAll('[data-nav-toggle]').forEach((button) => {
        button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
};

const resetTransientUiState = () => {
    clearBoardRefresh();
    setNavigationState(false);

    document.querySelectorAll('.dropdown-menu.show').forEach((menu) => {
        menu.classList.remove('show');
        menu.removeAttribute('data-bs-popper');
    });

    document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach((toggle) => {
        toggle.classList.remove('show');
        toggle.setAttribute('aria-expanded', 'false');
    });

    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');

    document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop').forEach((element) => {
        element.remove();
    });
};

let boardRefreshTimer = null;

const clearBoardRefresh = () => {
    if (boardRefreshTimer !== null) {
        window.clearTimeout(boardRefreshTimer);
        boardRefreshTimer = null;
    }
};

const setupBoardRefresh = () => {
    clearBoardRefresh();

    const marker = document.querySelector('[data-board-auto-refresh]');

    if (!marker || marker.dataset.refreshDisabled === '1') {
        return;
    }

    const intervalSeconds = Number.parseInt(marker.dataset.refreshInterval || '60', 10);
    const interval = Number.isFinite(intervalSeconds)
        ? Math.max(15, Math.min(3600, intervalSeconds))
        : 60;

    boardRefreshTimer = window.setTimeout(() => {
        window.location.reload();
    }, interval * 1000);
};

const closeDropdowns = (exceptToggle = null) => {
    document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach((toggle) => {
        if (toggle === exceptToggle) {
            return;
        }

        toggle.classList.remove('show');
        toggle.setAttribute('aria-expanded', 'false');

        const menu = toggle.closest('.dropdown')?.querySelector('.dropdown-menu');
        if (menu) {
            menu.classList.remove('show');
            menu.removeAttribute('data-bs-popper');
        }
    });
};

const toggleDropdown = (toggle) => {
    const menu = toggle.closest('.dropdown')?.querySelector('.dropdown-menu');

    if (!menu) {
        return;
    }

    const shouldOpen = !menu.classList.contains('show');
    closeDropdowns(toggle);
    toggle.classList.toggle('show', shouldOpen);
    toggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    menu.classList.toggle('show', shouldOpen);

    if (shouldOpen) {
        menu.setAttribute('data-bs-popper', 'static');
    } else {
        menu.removeAttribute('data-bs-popper');
    }
};

const updateReturningFields = () => {
    document.querySelectorAll('[data-status-choice]').forEach((select) => {
        const form = select.closest('form');
        const field = form?.querySelector('[data-returning-field]');

        if (!field) {
            return;
        }

        const selected = select.selectedOptions?.[0];
        const statusText = `${selected?.textContent || ''} ${select.value || ''}`.toLowerCase();
        const show = statusText.includes('out') || statusText.includes('away');
        field.hidden = !show;

        if (!show) {
            field.querySelectorAll('input, select, textarea').forEach((input) => {
                input.value = '';
            });
        }
    });
};

const updateRefreshIntervalFields = () => {
    document.querySelectorAll('[data-refresh-disabled-toggle]').forEach((checkbox) => {
        const form = checkbox.closest('form');
        const field = form?.querySelector('[data-refresh-interval-field]');

        if (!field) {
            return;
        }

        field.hidden = checkbox.checked;
    });
};

const advancedFilterRows = (filter) => Array.from(filter.querySelectorAll('[data-advanced-filter-row]'));

const advancedFilterGroupValue = (row) => {
    const value = Number.parseInt(row?.querySelector('input[name="filters[group][]"]')?.value || '1', 10);

    return Number.isFinite(value) && value > 0 ? value : 1;
};

const addAdvancedFilterRow = (filter, groupValue = null) => {
    if (!filter) {
        return;
    }

    const rows = filter.querySelector('[data-advanced-filter-rows]');
    const template = filter.querySelector('[data-advanced-filter-template]');

    if (!rows || !template) {
        return;
    }

    const fragment = template.content.cloneNode(true);
    const row = fragment.querySelector('[data-advanced-filter-row]');
    const groupInput = row?.querySelector('input[name="filters[group][]"]');

    if (groupInput) {
        groupInput.value = String(groupValue ?? advancedFilterGroupValue(advancedFilterRows(filter).at(-1)));
    }

    rows.appendChild(fragment);
};

const addAdvancedFilterGroup = (filter) => {
    const nextGroup = advancedFilterRows(filter).reduce(
        (highest, row) => Math.max(highest, advancedFilterGroupValue(row)),
        0,
    ) + 1;

    addAdvancedFilterRow(filter, nextGroup);
};

document.addEventListener('click', (event) => {
    const advancedFilterRemove = event.target.closest('[data-advanced-filter-remove]');
    if (advancedFilterRemove) {
        event.preventDefault();
        const filter = advancedFilterRemove.closest('[data-advanced-filter]');
        const row = advancedFilterRemove.closest('[data-advanced-filter-row]');
        row?.remove();

        if (filter && advancedFilterRows(filter).length === 0) {
            addAdvancedFilterRow(filter, 1);
        }

        return;
    }

    const advancedFilterAdd = event.target.closest('[data-advanced-filter-add]');
    if (advancedFilterAdd) {
        event.preventDefault();
        addAdvancedFilterRow(advancedFilterAdd.closest('[data-advanced-filter]'));
        return;
    }

    const advancedFilterAddGroup = event.target.closest('[data-advanced-filter-add-group]');
    if (advancedFilterAddGroup) {
        event.preventDefault();
        addAdvancedFilterGroup(advancedFilterAddGroup.closest('[data-advanced-filter]'));
        return;
    }

    const dropdownToggle = event.target.closest('[data-bs-toggle="dropdown"]');
    if (dropdownToggle) {
        event.preventDefault();
        event.stopPropagation();
        toggleDropdown(dropdownToggle);
        return;
    }

    if (!event.target.closest('.dropdown-menu')) {
        closeDropdowns();
    }

    const toggle = event.target.closest('[data-nav-toggle]');
    if (toggle) {
        setNavigationState(!document.body.classList.contains('nav-open'));
        return;
    }

    if (event.target.closest('[data-nav-close]')) {
        setNavigationState(false);
        return;
    }

    if (event.target.closest('.sidebar a')) {
        setNavigationState(false);
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        setNavigationState(false);
        closeDropdowns();
    }
});

document.addEventListener('change', (event) => {
    if (event.target.closest('[data-status-choice]')) {
        updateReturningFields();
    }

    if (event.target.closest('[data-refresh-disabled-toggle]')) {
        updateRefreshIntervalFields();
    }

    const select = event.target.closest('[data-document-nav-select]');
    if (select && select.value) {
        window.location.href = select.value;
    }
});

document.addEventListener('turbo:before-cache', resetTransientUiState);
document.addEventListener('turbo:load', () => {
    resetTransientUiState();
    updateReturningFields();
    updateRefreshIntervalFields();
    setupBoardRefresh();
});

window.addEventListener('pageshow', (event) => {
    resetTransientUiState();
    updateReturningFields();
    updateRefreshIntervalFields();
    setupBoardRefresh();

    if (event.persisted && document.body.classList.contains('app-shell')) {
        window.location.reload();
    }
});
