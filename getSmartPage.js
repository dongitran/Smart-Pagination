/**
 * Gets a smart page
 * @param {Object} client - Database client
 * @param {number} pageNumber - Page number to retrieve (default: 1)
 * @param {number} itemsPerPage - Number of items per page (default: 10)
 * @returns {Promise<Array>} - Array of items from the page
 */
async function getSmartPage(client, pageNumber = 1, itemsPerPage = 10) {
  if (pageNumber <= 0) return [];

  try {
    const { latest_mapping_id, max_page_in_mapping } = await client
      .query(
        `
          SELECT 
            (SELECT MAX(id) FROM big_table_views) AS latest_mapping_id,
            (SELECT MAX(page_number) FROM big_table_views) AS max_page_in_mapping
        `
      )
      .then((result) => result.rows[0]);
    let startIndex = (pageNumber - 1) * itemsPerPage;
    let endIndex = pageNumber * itemsPerPage;

    const exLength = await client
      .query(
        `
          SELECT COUNT(*) AS count
          FROM big_table
          WHERE id > $1
        `,
        [latest_mapping_id]
      )
      .then((r) => parseInt(r.rows[0].count));

    if (exLength > 0) {
      if (startIndex < exLength) {
        const eventActivities = await client.query(
          `
            SELECT id
            FROM big_table
            order by id desc
            offset ${(pageNumber - 1) * itemsPerPage}
            limit ${itemsPerPage}
          `
        );
        const result = eventActivities.rows;
        return result;
      } else {
        startIndex -= exLength;
        endIndex -= exLength;
      }
    }

    const lastPageCount = await client
      .query(
        `
          SELECT COUNT(*) AS count
          FROM big_table_views
          WHERE page_number = $1
        `,
        [max_page_in_mapping]
      )
      .then((r) => parseInt(r.rows[0].count));
    let startPage = 0;
    let endPage = 0;
    let startIndexOnPage = 0;
    let endIndexOnPage = 0;

    if (startIndex < lastPageCount) {
      startPage = 0;
      startIndexOnPage = startIndex;
    } else {
      startPage = Math.floor((startIndex - lastPageCount) / 10) + 1;
      startIndexOnPage = (startIndex - lastPageCount) % 10;
    }

    if (endIndex < lastPageCount) {
      endPage = 0;
      endIndexOnPage = endIndex;
    } else {
      endPage = Math.floor((endIndex - lastPageCount) / 10) + 1;
      endIndexOnPage = (endIndex - lastPageCount) % 10;
    }

    const datas = await client.query(
      `
        SELECT *
        FROM big_table_views
        WHERE page_number >= ${max_page_in_mapping - endPage} 
          and page_number <= ${max_page_in_mapping - startPage}
        order by id desc
      `
    );
    const eventActivityIds = datas.rows;
    const eventActivityIdsRevertPage = eventActivityIds.map((item) => ({
      ...item,
      page_number: max_page_in_mapping - item.page_number,
    }));

    const idsData = [];
    for (let i = startPage; i <= endPage; i++) {
      const dataInPage = eventActivityIdsRevertPage.filter(
        (item) => item.page_number == i
      );

      if (i === startPage && i === endPage) {
        idsData.push(
          ...dataInPage.slice(startIndexOnPage, startIndexOnPage + itemsPerPage)
        );
      } else if (i === startPage) {
        idsData.push(...dataInPage.slice(startIndexOnPage));
      } else if (i === endPage) {
        idsData.push(...dataInPage.slice(0, endIndexOnPage));
      } else {
        idsData.push(...dataInPage);
      }
    }

    const eventActivities = await client.query(
      `
        SELECT *
        FROM big_table
        where id in (${idsData.map((item) => item.id).join(",")})
        order by id desc
      `
    );
    const result = eventActivities.rows;
    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = { getSmartPage };
