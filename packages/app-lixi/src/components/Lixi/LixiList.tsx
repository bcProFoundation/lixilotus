import { Spin } from "antd";
import { Lixi } from "@bcpros/lixi-models/lib/lixi";
import { useAppSelector } from "src/store/hooks";
import { getIsGlobalLoading } from "src/store/loading/selectors";
import { CashLoadingIcon } from "@bcpros/lixi-components/components/Common/CustomIcons";
import LixiListItem from "./LixiListItem";

type LixiListProps = {
  lixies: Lixi[];
};

const LixiList = ({ lixies }: LixiListProps) => {

  const isLoading = useAppSelector(getIsGlobalLoading);

  return (
    <>
      <Spin spinning={isLoading} indicator={CashLoadingIcon}>
        <div style={{ paddingTop: '20px' }}>
          {lixies && lixies.length > 0 &&
            lixies.map(item => (
              <LixiListItem
                key={item.id}
                lixi={item}
              />
            ))
          }
        </div>
      </Spin>
    </>
  );
};

export default LixiList;
