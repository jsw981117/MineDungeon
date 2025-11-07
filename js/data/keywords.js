const KEYWORDS_DATA = {
  poison: {
    id: 'poison',
    name: '독',
    hasValue: true,
    description: '플레이어 행동 시(블록 열기, 공격, 아이템 사용) n만큼 피해를 입히고 수치 1 감소',
    stackable: true
  },
  burn: {
    id: 'burn',
    name: '화상',
    hasValue: true,
    description: '피해를 받을 때 n만큼 고정 피해 추가, 이후 n이 절반으로 감소(반내림)',
    stackable: true
  },
  freeze: {
    id: 'freeze',
    name: '빙결',
    hasValue: false,
    description: '적: 공격받을 때 반격 불가, 공격 후 해제 / 플레이어: 다음 공격이 피해를 입히지 않음, 공격 후 해제',
    stackable: false
  },
  destroy: {
    id: 'destroy',
    name: '파괴',
    hasValue: false,
    description: '블록과 아이템을 제거함',
    stackable: false
  }
};
