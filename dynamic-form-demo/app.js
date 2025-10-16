// JSON schema for the form
const formSchema = [
    { fd_key: 'name', fd_name: 'Name', type: 'input', fd_value: '', fd_data: {} },
    { fd_key: 'age', fd_name: 'Age', type: 'input', fd_value: '', fd_data: {} },
    { fd_key: 'gender', fd_name: 'Gender', type: 'select', fd_value: '', fd_data: { options: ['Male', 'Female', 'Other'] } },
    { fd_key: 'subscribe', fd_name: 'Subscribe to Newsletter', type: 'checkbox', fd_value: false, fd_data: {} },
    { fd_key: 'country', fd_name: 'Country', type: 'input', fd_value: '', fd_data: {}, visibleWhen: { key: 'subscribe', value: true } }
];

// Component registry
const componentRegistry = {
    input: (field) => `<label>${field.fd_name}: <input type="text" name="${field.fd_key}" value="${field.fd_value}" /></label>`,
    select: (field) => {
        const options = field.fd_data.options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
        return `<label>${field.fd_name}: <select name="${field.fd_key}">${options}</select></label>`;
    },
    checkbox: (field) => `<label><input type="checkbox" name="${field.fd_key}" ${field.fd_value ? 'checked' : ''} /> ${field.fd_name}</label>`
};

// Render form
function renderForm(schema, container) {
    container.innerHTML = '';
    schema.forEach(field => {
        // Handle visibility
        if (field.visibleWhen) {
            const dependency = document.querySelector(`[name="${field.visibleWhen.key}"]`);
            const isVisible = dependency && dependency.type === 'checkbox' ? dependency.checked === field.visibleWhen.value : false;
            if (!isVisible) return;
        }

        const component = componentRegistry[field.type];
        if (component) {
            container.innerHTML += component(field);
        }
    });
}

// Initialize form
const formContainer = document.getElementById('dynamic-form');
renderForm(formSchema, formContainer);

// Add event listeners for dynamic updates
formContainer.addEventListener('change', (e) => {
    const target = e.target;
    const field = formSchema.find(f => f.fd_key === target.name);
    if (field) {
        field.fd_value = target.type === 'checkbox' ? target.checked : target.value;
        renderForm(formSchema, formContainer); // Re-render for visibility updates
    }
});

// Handle form submission
const submitButton = document.getElementById('submit-btn');
const output = document.getElementById('output');
submitButton.addEventListener('click', () => {
    const formData = {};
    formSchema.forEach(field => {
        formData[field.fd_key] = field.fd_value;
    });
    output.textContent = JSON.stringify(formData, null, 2);
});
