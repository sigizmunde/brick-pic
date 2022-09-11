export function showBrickStats(mappedData, domContainer) {
  // mappedData = { data: [], width, mapping: [{id, border, color}] }
  const { data, mapping } = mappedData;
  const statsHTML = mapping
    .map(elem => {
      const quantity = data.filter(el => el === elem.id).length;
      return `<li class="stats_item"><div class="stats_sample" id="${elem.id}" style="--color-sample:${elem.color}"></div><span>${quantity} pieces</span></li>`;
    })
    .join('');
  domContainer.innerHTML = '<ul class="stats_list">' + statsHTML + '</ul>';
}
