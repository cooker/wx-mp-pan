(function () {
  window.AdminComponents = window.AdminComponents || {};
  window.AdminComponents.AdminPageHeader = {
    name: 'AdminPageHeader',
    props: {
      title: {
        type: String,
        required: true
      },
      descHtml: {
        type: String,
        required: true
      }
    },
    template: `
      <div class="page-head">
        <h2>{{ title }}</h2>
        <p class="page-desc" v-html="descHtml"></p>
      </div>
    `
  };
})();
