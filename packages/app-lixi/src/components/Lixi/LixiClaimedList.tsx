import { TableVirtuoso } from 'react-virtuoso';
import styled from 'styled-components';

const StyledTable = styled.div`
  height: 35vh;
  margin-bottom: 5px;

  .lixi-claimed-list {
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    width: 100%;
    border-collapse: collapse;
  }
`;

const StyledTableHead = styled.th`
  border-bottom: 1px solid #e0e0e0;
  padding: 10px;
`;

const StyledTableData = styled.td`
  border-bottom: 1px solid #e0e0e0;
  padding: 18px;
  width: 2%;
  display: table-cell;
  background: white;
`;

const LixiClaimedList = props => {
  const { dataSource, columns, loadMore } = props;

  const lixiClaimedDataSource =
    dataSource &&
    dataSource.map((item, i) => {
      return {
        num: i + 1,
        claimedAt: item.claimedAt,
        amount: parseFloat(item.amount).toFixed(2)
      };
    });

  return (
    <StyledTable>
      <TableVirtuoso
        className="lixi-claimed-list"
        style={{ height: '100%', borderCollapse: 'separate' }}
        data={lixiClaimedDataSource}
        overscan={200}
        endReached={loadMore}
        components={{
          Table: ({ style, ...props }) => <table {...props} style={{ ...style, borderCollapse: 'separate' }} />
        }}
        fixedHeaderContent={() => (
          <tr>
            {columns.map(column => {
              return (
                <StyledTableHead key={column.dataIndex} style={{ background: 'white', tableLayout: 'fixed' }}>
                  {column.title}
                </StyledTableHead>
              );
            })}
          </tr>
        )}
        itemContent={(index, item) => {
          return (
            <>
              <StyledTableData>{item.num}</StyledTableData>
              <StyledTableData>{item.amount}</StyledTableData>
              <StyledTableData>{item.claimedAt}</StyledTableData>
            </>
          );
        }}
        totalCount={dataSource.length}
      />
    </StyledTable>
  );
};

export default LixiClaimedList;
